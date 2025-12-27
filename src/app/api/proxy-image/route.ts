import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Use edge runtime for better performance

/**
 * Proxy endpoint for external card images
 * Solves CORS issues by fetching images server-side
 *
 * Usage: /api/proxy-image?url=https://images.pokemontcg.io/me2/130.png
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    // Validate the URL is from allowed domains (security measure)
    const allowedDomains = [
      "images.pokemontcg.io",
      "raw.githubusercontent.com"
    ];

    const parsedUrl = new URL(url);
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return new NextResponse("Domain not allowed", { status: 403 });
    }

    // Fetch the image
    const imageResponse = await fetch(url, {
      headers: {
        "User-Agent": "BinderDex/1.0"
      }
    });

    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch image", { status: imageResponse.status });
    }

    // Get the image data
    const imageData = await imageResponse.arrayBuffer();

    // Determine content type
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Return the image with CORS headers
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
