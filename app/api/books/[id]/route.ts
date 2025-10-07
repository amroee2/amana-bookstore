import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books/[id] - Get a single book by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Find the book with the matching ID
    const book = data.books.find((book: any) => book.id === id);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      book
    });

  } catch (error) {
    console.error('Error reading book data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}