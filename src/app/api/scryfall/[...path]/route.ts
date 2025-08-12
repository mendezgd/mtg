import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Your implementation here
    // Example: forward the request to Scryfall API
    const path = params.path.join("/");
    const scryfallUrl = `https://api.scryfall.com/${path}`;

    const response = await fetch(scryfallUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
