import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause for filtering
    const where: any = {
      isDeleted: false,
    };

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply status filter
    if (status) {
      if (status === 'EXPIRED') {
        // For expired, check if the plan end date is in the past
        where.plans = {
          some: {
            isAddOn: false,
            endDate: { lt: new Date().toISOString() }
          }
        };
      } else {
        where.status = status;
      }
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        whatsAppAccount: {
          include: {
            campaigns: true,
            recipients: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const companies = users.map((user) => {
      const plans = user.plans as any[];
      const currentPlan = plans?.find((plan: any) => !plan.isAddOn);
      const planName = currentPlan?.planName || 'FREE';
      const endDate = currentPlan?.endDate;
      const isExpired = endDate ? new Date(endDate) < new Date() : false;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: planName,
        status: isExpired ? 'EXPIRED' : (user.status === 'ACTIVE' ? 'ACTIVE' : user.status),
        expiresAt: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        userCount: 1,
        campaignCount: user.whatsAppAccount?.campaigns?.length || 0,
        contactCount: user.whatsAppAccount?.recipients?.length || 0,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.updatedAt.toISOString(),
        subscriptionId: null,
        billingEmail: user.email,
        phoneNumber: user.phone,
        address: null,
        website: null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}