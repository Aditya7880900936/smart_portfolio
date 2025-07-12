// src/app/api/portfolio/[id]/share/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

interface Context {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Check if sharing token already exists
    const existingAccess = await prisma.sharedPortfolioAccess.findFirst({
      where: {
        portfolioId: params.id,
        isRevoked: false
      }
    })

    if (existingAccess) {
      return NextResponse.json({
        token: existingAccess.token,
        shareUrl: `${process.env.NEXTAUTH_URL}/portfolio/${existingAccess.token}`
      })
    }

    // Create new sharing token
    const token = nanoid(21) // 21 chars = ~132 bits of entropy
    
    const sharedAccess = await prisma.sharedPortfolioAccess.create({
      data: {
        portfolioId: params.id,
        userId: user.id,
        token,
      }
    })

    // Update portfolio visibility
    await prisma.portfolio.update({
      where: { id: params.id },
      data: { visibility: 'SMART_SHARED' }
    })

    return NextResponse.json({
      token: sharedAccess.token,
      shareUrl: `${process.env.NEXTAUTH_URL}/portfolio/${sharedAccess.token}`
    })
  } catch (error) {
    console.error('Share portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Revoke all sharing tokens for this portfolio
    await prisma.sharedPortfolioAccess.updateMany({
      where: {
        portfolioId: params.id,
        isRevoked: false
      },
      data: {
        isRevoked: true
      }
    })

    // Update portfolio visibility back to private
    await prisma.portfolio.update({
      where: { id: params.id },
      data: { visibility: 'PRIVATE' }
    })

    return NextResponse.json({ message: 'Sharing revoked successfully' })
  } catch (error) {
    console.error('Revoke share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}