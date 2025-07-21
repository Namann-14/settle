import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUserId = session.user.id;
    const groupId = params.id;

    // Check if user is a member of this group
    const membership = await prisma.usersOnGroups.findUnique({
      where: {
        userId_groupId: {
          userId: currentUserId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return new NextResponse("Not a member of this group", { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { description, amount, category, date, splitType, paidByUserId } = body;

    // Validate required fields
    if (!description || !amount || !date || !splitType || !paidByUserId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    // Validate split type
    if (!['EQUAL', 'UNEQUAL', 'PERCENTAGE'].includes(splitType)) {
      return new NextResponse("Invalid split type", { status: 400 });
    }

    // Get all group members for splitting
    const groupMembers = await prisma.usersOnGroups.findMany({
      where: { groupId },
      include: { user: true },
    });

    if (groupMembers.length === 0) {
      return new NextResponse("No members found in group", { status: 400 });
    }

    // Create expense with splits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the expense
      const expense = await tx.expense.create({
        data: {
          description,
          amount: parsedAmount,
          category: category || null,
          date: new Date(date),
          splitType: splitType as any,
          groupId,
          paidByUserId,
          createdByUserId: currentUserId,
        },
      });

      // Calculate splits based on split type
      let splits: { userId: string; amountOwed: number }[] = [];

      if (splitType === 'EQUAL') {
        const amountPerPerson = parsedAmount / groupMembers.length;
        splits = groupMembers.map(member => ({
          userId: member.userId,
          amountOwed: amountPerPerson,
        }));
      } else {
        // For now, default to equal split for UNEQUAL and PERCENTAGE
        // You can implement custom logic later
        const amountPerPerson = parsedAmount / groupMembers.length;
        splits = groupMembers.map(member => ({
          userId: member.userId,
          amountOwed: amountPerPerson,
        }));
      }

      // Create expense splits
      await tx.expenseSplit.createMany({
        data: splits.map(split => ({
          expenseId: expense.id,
          userId: split.userId,
          amountOwed: split.amountOwed,
        })),
      });

      // Return expense with splits
      return await tx.expense.findUnique({
        where: { id: expense.id },
        include: {
          paidBy: {
            select: { id: true, name: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          splits: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[CREATE_EXPENSE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
