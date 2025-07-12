// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'SMART_SHARED']).default('PRIVATE'),
  cash: z.number().min(0).default(0),
  holdings: z.array(z.object({
    symbol: z.string().min(1).max(10),
    quantity: z.number().min(0),
    avgPrice: z.number().min(0).optional(),
  })).default([])
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreatePortfolioSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create portfolio with holdings
    const portfolio = await prisma.portfolio.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        visibility: validatedData.visibility,
        cash: validatedData.cash,
        userId: user.id,
        holdings: {
          create: validatedData.holdings.map(holding => ({
            symbol: holding.symbol.toUpperCase(),
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
          }))
        }
      },
      include: {
        holdings: true
      }
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Portfolio creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        holdings: true,
        _count: {
          select: { holdings: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}