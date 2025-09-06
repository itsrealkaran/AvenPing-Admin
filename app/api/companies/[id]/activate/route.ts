import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if already active
    if (user.status === "ACTIVE") {
      return NextResponse.json(
        { error: 'Company is already active' },
        { status: 400 }
      );
    }

    // Check if company is suspended (not pending)
    if (user.status !== "SUSPENDED") {
      return NextResponse.json(
        { error: 'Only suspended companies can be activated' },
        { status: 400 }
      );
    }

    // Update user status to active
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Company activated successfully',
      company: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        activatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error activating company:', error);
    return NextResponse.json(
      { error: 'Failed to activate company' },
      { status: 500 }
    );
  }
}
