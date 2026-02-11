import { auth } from '@/lib/auth';
import {
  convertFilterModelToPrisma,
  convertSortModelToPrisma,
  createPaginatedResponse,
  getPaginationParams,
  getSkipValue,
} from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/users
 *
 * Retrieves a paginated list of users in the system. Only accessible by administrators.
 * Supports server-side pagination, sorting, and filtering.
 *
 * Query Parameters:
 *   - page: (number) The page number (1-based, default: 1)
 *   - pageSize: (number) The number of users per page (default: 20)
 *   - sortModel: (string, JSON) Array of sort objects, e.g. [{"colId":"name","sort":"asc"}]
 *   - filterModel: (string, JSON) Object of filter conditions, e.g. {"name":{"type":"contains","filter":"John"}}
 *
 * @param {NextRequest} request - The HTTP request object containing pagination, sorting, and filtering parameters
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - Success: Paginated response with user data, total count, and pagination info
 *   - Error 401: Not authenticated (user is not an admin)
 *   - Error 500: Server error during user retrieval
 *
 * @example
 * // Request: GET /api/users?page=1&pageSize=20&sortModel=[{"colId":"name","sort":"asc"}]&filterModel={"name":{"type":"contains","filter":"John"}}
 *
 * // Success response
 * {
 *   "data": [
 *     {
 *       "id": "user123",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "role": "USER",
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "updatedAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ],
 *   "totalCount": 150,
 *   "page": 1,
 *   "pageSize": 20,
 *   "totalPages": 8
 * }
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { page, pageSize, sortModel, filterModel } =
      getPaginationParams(request);
    const orderBy = convertSortModelToPrisma(sortModel);
    const where = convertFilterModelToPrisma(filterModel);
    const skip = getSkipValue(page, pageSize);

    // Get total count for pagination with filters applied
    const totalCount = await prisma.user.count({
      where,
    });

    // Get paginated users with filters and sorting
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where,
      orderBy,
      skip,
      take: pageSize,
    });

    const paginatedResponse = createPaginatedResponse(
      users,
      totalCount,
      page,
      pageSize
    );
    return NextResponse.json(paginatedResponse);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 *
 * Updates an existing user's information. Only accessible by administrators.
 *
 * @param {Request} req - The HTTP request object containing user data in JSON format
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - Success: Updated user object
 *   - Error 401: Not authenticated (user is not an admin)
 *   - Error 500: Server error during user update
 *
 * @example
 * // Request body
 * {
 *   "id": "user123",
 *   "name": "Updated Name",
 *   "email": "updated@example.com",
 *   "role": "USER"
 * }
 *
 * // Success response
 * {
 *   "id": "user123",
 *   "name": "Updated Name",
 *   "email": "updated@example.com",
 *   "role": "USER",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function POST(req: Request) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { ...user, updatedAt: new Date() },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

/**
 * PUT /api/users
 *
 * Updates the currently authenticated user's profile information (name and email).
 * Users can only update their own profile information.
 *
 * @param {Request} req - The HTTP request object containing name and email in JSON format
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - Success: Updated user object
 *   - Error 401: Not authenticated (no valid session)
 *   - Error 500: Server error during user update
 *
 * @example
 * // Request body
 * {
 *   "name": "New Name",
 *   "email": "newemail@example.com"
 * }
 *
 * // Success response
 * {
 *   "id": "currentuser123",
 *   "name": "New Name",
 *   "email": "newemail@example.com",
 *   "role": "USER",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function PUT(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { name, email } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, updatedAt: new Date() },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users
 *
 * Deletes a user from the system. Only accessible by administrators.
 * Administrators cannot delete their own account.
 *
 * @param {Request} req - The HTTP request object with user ID in query parameters
 * @returns {Promise<NextResponse>} JSON response containing:
 *   - Success: Confirmation message with deleted user information
 *   - Error 400: Missing user ID or attempting to delete own account
 *   - Error 401: Not authenticated (user is not an admin)
 *   - Error 404: User not found
 *   - Error 500: Server error during user deletion
 *
 * @example
 * // Request URL: DELETE /api/users?id=user123
 *
 * // Success response
 * {
 *   "message": "User deleted successfully",
 *   "deletedUser": {
 *     "id": "user123",
 *     "name": "John Doe",
 *     "email": "john@example.com"
 *   }
 * }
 *
 * // Error responses
 * // 400: { "error": "User ID is required" }
 * // 400: { "error": "Cannot delete your own account" }
 * // 404: { "error": "User not found" }
 */
export async function DELETE(req: Request) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
