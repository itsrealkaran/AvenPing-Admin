import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // In a real implementation, you would:
    // 1. Pause subscription in payment provider (Stripe, etc.)
    // 2. Send notification email to company
    // 3. Log the action for audit purposes
    // 4. Disable company's access to the platform

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
