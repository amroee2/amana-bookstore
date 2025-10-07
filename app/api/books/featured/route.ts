import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books/featured - Get all books with featured set to true
export async function GET(request: NextRequest) {
  try {
    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Filter books where featured is true
    const featuredBooks = data.books.filter((book: any) => book.featured === true);

    return NextResponse.json({
      books: featuredBooks,
      total: featuredBooks.length
    });

  } catch (error) {
    console.error('Error fetching featured books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured books' },
      { status: 500 }
    );
  }
}