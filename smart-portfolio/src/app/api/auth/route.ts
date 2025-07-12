// src/app/api/auth/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// import bcrypt from 'bcrypt'

// User registration endpoint
export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(),
      }
    })

    // Create default portfolio
    await prisma.portfolio.create({
      data: {
        name: 'My Portfolio',
        description: 'Default portfolio',
        userId: user.id,
        visibility: 'PRIVATE',
        cash: 0,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('[AUTH_REGISTER]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Get current user session
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        portfolios: {
          where: {
            OR: [
              { visibility: 'PUBLIC' },
              { visibility: 'SMART_SHARED' },
              { userId: session.user.email }
            ]
          },
          select: {
            id: true,
            name: true,
            description: true,
            visibility: true,
            cash: true,
            createdAt: true
          }
        },
        sharedAccess: {
          include: {
            portfolio: {
              select: {
                id: true,
                name: true,
                description: true,
                visibility: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[AUTH_SESSION]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { name, image } = await request.json()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { name, image }
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image
    })
  } catch (error) {
    console.error('[AUTH_UPDATE]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}