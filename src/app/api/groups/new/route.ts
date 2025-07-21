import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check if our user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const currentUserId = session.user.id;

    // Getting data from the req object
    const body = await req.json();
    const { name, description, memberIds = [] } = body;
    if (!name) {
      return new NextResponse("Group name is required", {
        status: 400,
      });
    }

    // Validate memberIds if provided
    if (memberIds.length > 0) {
      const validUsers = await prisma.user.findMany({
        where: {
          id: {
            in: memberIds,
          },
        },
        select: { id: true },
      });

      if (validUsers.length !== memberIds.length) {
        return new NextResponse("Some user IDs are invalid", {
          status: 400,
        });
      }
    }

    // Create the group and add members in a transaction
    const newGroup = await prisma.group.create({
      data: {
        name,
        description,
        createdByUserId: currentUserId,
        members: {
          create: [
            // Add creator as first member
            {
              userId: currentUserId,
            },
            // Add selected members
            ...memberIds.map((userId: string) => ({
              userId,
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            expenses: true,
            settlements: true,
          },
        },
      },
    });
    return NextResponse.json(newGroup, {status: 201});
  } catch (error) {
    console.error("[CREATE_GROUP_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
