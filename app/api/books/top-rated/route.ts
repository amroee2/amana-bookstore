import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books/top-rated - Get top 10 rated books (rating × reviewCount)
export async function GET(request: NextRequest) {
  try {
    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Calculate weighted rating (rating × reviewCount) and sort
    const booksWithScore = data.books.map((book: any) => ({
      ...book,
      weightedRating: book.rating * book.reviewCount
    }));

    // Sort by weighted rating in descending order and take top 10
    const topRatedBooks = booksWithScore
      .sort((a: any, b: any) => b.weightedRating - a.weightedRating)
      .slice(0, 10);

    return NextResponse.json({
      books: topRatedBooks,
      total: topRatedBooks.length,
      criteria: "Rating × Review Count (weighted rating)"
    });

  } catch (error) {
    console.error('Error fetching top rated books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top rated books' },
      { status: 500 }
    );
  }
}