import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Validate required fields
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
        { status: 400 }
      );
    }

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

    // Check if already suspended
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: 'Company is already suspended' },
        { status: 400 }
      );
    }

    // Update user status to suspended
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Company suspended successfully',
      company: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        suspensionReason: reason,
        suspendedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error suspending company:', error);
    return NextResponse.json(
      { error: 'Failed to suspend company' },
      { status: 500 }
    );
  }
}
