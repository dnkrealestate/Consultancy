import dbConnect from '@/lib/db';
import Service from '@/models/Service';

export async function GET() {
  try {
    await dbConnect();
    const services = await Service.find({}, 'title slug').sort({ title: 1 }).lean();
    return Response.json(services);
  } catch {
    return Response.json([], { status: 500 });
  }
}
