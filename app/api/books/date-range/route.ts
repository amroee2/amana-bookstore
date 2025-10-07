import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// GET /api/books/date-range - Get books published within a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { 
          error: 'Both start and end date parameters are required',
          example: '/api/books/date-range?start=2022-01-01&end=2023-12-31'
        },
        { status: 400 }
      );
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { 
          error: 'Invalid date format. Use YYYY-MM-DD format',
          example: '/api/books/date-range?start=2022-01-01&end=2023-12-31'
        },
        { status: 400 }
      );
    }

    if (startDateObj > endDateObj) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      );
    }

    // Get the path to the books.json file
    const jsonDirectory = path.join(process.cwd(), 'app', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/books.json', 'utf8');
    const data = JSON.parse(fileContents);

    // Filter books by publication date range
    const filteredBooks = data.books.filter((book: any) => {
      const bookDate = new Date(book.datePublished);
      return bookDate >= startDateObj && bookDate <= endDateObj;
    });

    return NextResponse.json({
      books: filteredBooks,
      total: filteredBooks.length,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Error filtering books by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books by date range' },
      { status: 500 }
    );
  }
}