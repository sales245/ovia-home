import os
import logging
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class SheetsDB:
    def __init__(self):
        self.spreadsheet = None
        self.sheets = {}
        self.setup_complete = False
    
    def connect(self):
        try:
            # Google Sheets API scope
            scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
            
            # Get credentials from environment variable
            creds_dict = eval(os.environ.get('GOOGLE_SHEETS_CREDENTIALS', '{}'))
            if not creds_dict:
                raise ValueError("Google Sheets credentials not found in environment variables")
            
            # Setup credentials and client
            creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
            client = gspread.authorize(creds)
            
            # Open spreadsheet
            spreadsheet_id = os.environ.get('SPREADSHEET_ID')
            if not spreadsheet_id:
                raise ValueError("Spreadsheet ID not found in environment variables")
                
            self.spreadsheet = client.open_by_key(spreadsheet_id)
            
            # Initialize or get worksheets
            self.sheets = {
                'products': self._get_or_create_sheet('Products'),
                'inquiries': self._get_or_create_sheet('Inquiries'),
                'orders': self._get_or_create_sheet('Orders'),
                'customers': self._get_or_create_sheet('Customers')
            }
            
            self.setup_complete = True
            logging.info("Successfully connected to Google Sheets")
            return True
            
        except Exception as e:
            logging.error(f"Failed to connect to Google Sheets: {str(e)}")
            return False
    
    def _get_or_create_sheet(self, title: str) -> gspread.Worksheet:
        """Get existing worksheet or create new one with headers"""
        try:
            return self.spreadsheet.worksheet(title)
        except gspread.WorksheetNotFound:
            worksheet = self.spreadsheet.add_worksheet(title=title, rows=1000, cols=20)
            
            # Set headers based on sheet type
            headers = {
                'Products': ['id', 'category', 'name', 'features', 'badges', 'retail_price', 'wholesale_price', 'stock', 'created_at'],
                'Inquiries': ['id', 'name', 'email', 'company', 'phone', 'message', 'created_at'],
                'Orders': ['id', 'customer_id', 'products', 'total', 'status', 'created_at'],
                'Customers': ['id', 'name', 'email', 'company', 'phone', 'country', 'created_at']
            }
            
            worksheet.append_row(headers.get(title, ['id', 'created_at']))
            return worksheet
    
    async def insert_one(self, collection: str, data: Dict[str, Any]) -> str:
        """Insert a document into a collection (sheet)"""
        if not self.setup_complete:
            self.connect()
            
        sheet = self.sheets.get(collection)
        if not sheet:
            raise ValueError(f"Collection {collection} not found")
        
        # Ensure ID and timestamp
        if 'id' not in data:
            data['id'] = str(hash(str(datetime.now(timezone.utc))))
        data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        # Convert data to row based on headers
        headers = sheet.row_values(1)
        row = [str(data.get(header, '')) for header in headers]
        
        sheet.append_row(row)
        return data['id']
    
    async def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document in a collection (sheet)"""
        if not self.setup_complete:
            self.connect()
            
        sheet = self.sheets.get(collection)
        if not sheet:
            raise ValueError(f"Collection {collection} not found")
        
        # Get all data
        data = sheet.get_all_records()
        
        # Find matching row
        for row in data:
            if all(row.get(k) == v for k, v in query.items()):
                return row
        return None
    
    async def find_many(self, collection: str, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Find multiple documents in a collection (sheet)"""
        if not self.setup_complete:
            self.connect()
            
        sheet = self.sheets.get(collection)
        if not sheet:
            raise ValueError(f"Collection {collection} not found")
        
        # Get all data
        data = sheet.get_all_records()
        
        if not query:
            return data
            
        # Filter based on query
        return [row for row in data if all(row.get(k) == v for k, v in query.items())]
    
    async def update_one(self, collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        """Update a single document in a collection (sheet)"""
        if not self.setup_complete:
            self.connect()
            
        sheet = self.sheets.get(collection)
        if not sheet:
            raise ValueError(f"Collection {collection} not found")
        
        # Get all data and headers
        data = sheet.get_all_records()
        headers = sheet.row_values(1)
        
        # Find matching row
        for idx, row in enumerate(data, start=2):  # start=2 because idx 1 is headers
            if all(row.get(k) == v for k, v in query.items()):
                # Update row
                for k, v in update.items():
                    if k in headers:
                        col = headers.index(k) + 1
                        sheet.update_cell(idx, col, str(v))
                return True
        return False

# Create global instance
db = SheetsDB()