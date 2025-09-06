import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { newExpiryDate, planType } = body;

    // Validate required fields
    if (!newExpiryDate) {
      return NextResponse.json(
        { error: 'New expiry date is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const expiryDate = new Date(newExpiryDate);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if date is in the future
    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
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

    // Update user's plans
    const currentPlans = user.plans as any[];
    const updatedPlans = [...currentPlans];

    if (planType) {
      // Add new plan entry
      updatedPlans.push({
        planName: planType,
        period: "yearly",
        isAddOn: false,
        endDate: expiryDate.toISOString().split('T')[0]
      });
    } else {
      // Update existing plan end date
      const currentPlanIndex = updatedPlans.findIndex((plan: any) => !plan.isAddOn);
      if (currentPlanIndex !== -1) {
        updatedPlans[currentPlanIndex] = {
          ...updatedPlans[currentPlanIndex],
          endDate: expiryDate.toISOString().split('T')[0]
        };
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        plans: updatedPlans,
        updatedAt: new Date(),
      },
    });

    // In a real implementation, you would:
    // 1. Update subscription in payment provider (Stripe, etc.)
    // 2. Send notification email to company
    // 3. Log the action for audit purposes

    return NextResponse.json({
      success: true,
      message: 'Plan extended successfully',
      company: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        expiresAt: expiryDate.toISOString(),
        plan: planType || (updatedPlans.find((plan: any) => !plan.isAddOn)?.planName || "FREE")
      }
    });

  } catch (error) {
    console.error('Error extending plan:', error);
    return NextResponse.json(
      { error: 'Failed to extend plan' },
      { status: 500 }
    );
  }
}
