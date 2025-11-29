import { NextResponse } from "next/server";
import { isAdmin, verifyCsrfToken } from "../../../../../../lib/CsrfSessionManagement";
import { updateItem, deleteItem, getItemById } from "../../../../../../lib/RentalManagementSystem";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const csrf = data.csrf;
  if (!(await verifyCsrfToken(csrf))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { id } = await params;
  const existed = getItemById(Number(id));
  if (!existed) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Solo incluir campos que están definidos en el request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  
  if (data.name !== undefined) updates.name = data.name;
  if (data.category !== undefined) updates.category = data.category;
  if (data.pricePerDay !== undefined) updates.pricePerDay = Number(data.pricePerDay);
  if (data.sizes !== undefined) updates.sizes = Array.isArray(data.sizes) ? data.sizes : [];
  if (data.color !== undefined) updates.color = data.color;
  if (data.style !== undefined) updates.style = data.style;
  if (data.description !== undefined) updates.description = data.description;
  if (data.images !== undefined) updates.images = data.images;
  if (data.alt !== undefined) updates.alt = data.alt;

  const updated = updateItem(id, updates);
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ item: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const csrf = data.csrf;
  if (!(await verifyCsrfToken(csrf))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { id } = await params;
  
  try {
    const ok = deleteItem(id);
    if (!ok) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    if (message.includes('existing rentals')) {
      return NextResponse.json({ error: "Cannot delete item with existing rentals" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
