# Madura ERP System

A comprehensive Enterprise Resource Planning (ERP) system built for Madura Papers, a paper manufacturing company. This advanced system manages the complete workflow from binding advice creation to production, inventory management, dispatch, and invoicing with dynamic CRUD operations and real-time calculations.

## 🔧 Recent Fixes & Improvements (2025-09-29)

### ✅ Fixed NaN Error in BindingAdviceForm

- **Issue**: React warning "Received NaN for the `children` attribute" in table cells
- **Root Cause**: Incorrect property access in NotebookType interface (`standardPages` vs `pages`)
- **Solution**:
  - Updated NotebookType interface to use `pages` instead of `standardPages`
  - Added proper validation to prevent NaN values in calculations
  - Enhanced error handling in paper size summary rendering

### ✅ Updated Data Interfaces to Match New Format

- **PaperSize Interface**: Added optional `description` field
- **NotebookType Interface**:
  - Changed `standardPages` to `pages`
  - Made `steps` accept both string and number types
  - Added optional `description` field
- **Updated sample data** in `db.json` to match new format

### ✅ Enhanced Paper Size & Notebook Type Data

- Added comprehensive paper size data:
  - A5 Crown (210 x 297 mm)
  - A4 (49 x 74 mm)
  - Crown 49 x 74 (standard type)
- Added notebook type data:
  - Standard Notebook (200 pages, academic category)
  - Default notebook (96 pages, 4 x 3 steps)

### ✅ Fixed JSON Server Configuration

- Resolved JSON parsing errors in `db.json`
- Updated API configuration to use port 3002 (avoiding conflicts)
- Added environment variable support (`.env` file)
- Verified all API endpoints are working correctly

### ✅ Improved Calculation Logic

- Added proper number validation in calculations
- Enhanced error handling to prevent NaN propagation
- Improved paper size mapping functionality
- Fixed line item calculations with proper fallbacks

## 🏗️ Project Architecture Analysis

### Frontend Architecture

- **Framework**: React 18 with TypeScript for type safety
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: React Router DOM v7 for client-side routing
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography

### Backend Architecture

- **API**: JSON Server for mock REST API during development
- **Data Storage**: JSON file-based database (`db.json`)
- **API Layer**: Axios for HTTP client with interceptors
- **Type Safety**: Full TypeScript interfaces for all entities

### Key Components Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components for CRUD operations
│   └── shared/         # Common components (Header, Sidebar)
├── pages/              # Route-based page components
│   ├── inventory/      # Inventory management pages
│   ├── billing/        # Billing and payment pages
│   ├── masters/        # Master data management
│   └── system/         # System administration
├── hooks/              # Custom React hooks
│   ├── queries/        # React Query hooks
│   └── useData.ts      # Legacy data hooks
├── services/           # API services and configurations
│   ├── api.ts          # Main API service
│   ├── entities.ts     # TypeScript interfaces
│   └── unifiedApi.ts   # Enhanced API layer
├── providers/          # Context providers
└── context/            # React contexts
```

### Data Flow Architecture

1. **User Interaction** → React Components
2. **State Management** → React Query hooks
3. **API Calls** → Axios services
4. **Data Persistence** → JSON Server
5. **Real-time Updates** → Query invalidation & refetch

## 🚀 Features

### Core Modules

- **Enhanced Binding Advice Management** - Create binding advice with product mapping, value calculations, and finished product integration
- **Dynamic Job Card Management** - Automated job card creation from production plans with material mapping
- **Advanced Inventory Management** - Real-time inventory tracking with finished product calculations and binding advice integration
- **Production Planning** - Fully dynamic CRUD operations with job card generation and resource planning
- **Smart Dispatch Management** - Job card mapping with automatic data population and multi-location delivery
- **Automated Billing & Invoicing** - Generate invoices based on binding advice with line item mapping
- **Calculation Center** - Save and manage calculations with JSON server storage
- **System Management** - User, role, and system settings management

### Key Capabilities

- **Real-time Inventory Tracking** - Automatic stock reservation, consumption, and finished product calculations
- **Product Mapping & Value Calculations** - Dynamic product mapping in binding advice with automatic rate calculations
- **Enhanced Production Workflow** - Complete production lifecycle with job card automation and material mapping
- **Dynamic CRUD Operations** - Full create, read, update, delete operations across all modules with React Query
- **Calculation Storage** - Save and manage calculations in JSON server with metadata and versioning
- **Invoice Generation** - Automated invoice creation based on binding advice with line item mapping
- **Job Card Automation** - Automatic job card creation from production plans with material allocation
- **Advanced Reporting** - Comprehensive business reports and analytics with real-time data
- **Role-based Access Control** - Secure user management with permissions
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Immediate Screen Updates** - Real-time UI updates with optimistic mutations

## 🛠 Technology Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query (@tanstack/react-query)** - Server state management
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

### Backend

- **JSON Server** - Mock REST API for development
- **Node.js** - Runtime environment

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **React Query Devtools** - Development debugging

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Madura-ui-ERP
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the JSON Server (Backend)**

   ```bash
   npm run server
   ```

   This starts the API server on `http://localhost:3001`

   **Note**: If port 3001 is in use, you can start on a different port:

   ```bash
   npx json-server --watch db.json --port 3002
   ```

   Then update the `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:3002
   ```

4. **Start the Development Server (Frontend)**

   ```bash
   npm run dev
   ```

   This starts the React app on `http://localhost:5174`

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── Header.tsx      # Application header
│   └── Sidebar.tsx     # Navigation sidebar
├── hooks/              # Custom React hooks
│   ├── queries/        # React Query hooks
│   ├── useData.ts      # Legacy data hook
│   └── useDataQueries.ts # Combined query hooks
├── pages/              # Page components
│   ├── system/         # System management pages
│   ├── inventory/      # Inventory pages
│   └── ...            # Other page modules
├── providers/          # React context providers
│   └── QueryProvider.tsx # React Query provider
├── services/           # API services
│   ├── api.ts          # Single unified API service with Axios and React Query
│   ├── axiosApi.ts     # Legacy Axios configuration (deprecated)
│   ├── entities.ts     # Legacy type definitions (deprecated)
│   └── unifiedApi.ts   # Advanced unified API (optional)
└── context/           # React contexts
    └── AuthContext.tsx # Authentication context
```

## 🔧 API Architecture

### Single Unified API Service (`src/services/api.ts`)

The system now uses a single, comprehensive API service built with Axios and React Query:

```typescript
// Generic CRUD operations for all entities
export class ApiService<T extends { id: string }> {
  async getAll(): Promise<T[]>;
  async getById(id: string): Promise<T>;
  async create(data: Omit<T, "id">): Promise<T>;
  async update(id: string, data: Partial<T>): Promise<T>;
  async delete(id: string): Promise<void>;
  async search(params: Record<string, any>): Promise<T[]>;
  async bulkCreate(items: Omit<T, "id">[]): Promise<T[]>;
  async bulkUpdate(updates: { id: string; data: Partial<T> }[]): Promise<T[]>;
  async bulkDelete(ids: string[]): Promise<void>;
}
```

### React Query Integration (`src/hooks/useApiQueries.ts`)

Comprehensive React Query hooks for all entities:

```typescript
// Generic CRUD hooks factory
export function createCrudHooks<T>(entity: string, service: ApiService<T>) {
  return {
    useGetAll: (filters?: Record<string, any>) => useQuery(...),
    useGetById: (id: string) => useQuery(...),
    useCreate: () => useMutation(...),
    useUpdate: () => useMutation(...),
    useDelete: () => useMutation(...),
    useBulkCreate: () => useMutation(...),
    useBulkUpdate: () => useMutation(...),
    useBulkDelete: () => useMutation(...),
  };
}
```

### API Endpoints

The system uses a JSON Server backend with the following endpoints:

```
http://localhost:3001/
├── bindingAdvices     # Binding advice records
├── jobCards          # Job card management
├── inventory         # Inventory items
├── dispatches        # Dispatch records
├── invoices          # Invoice management
├── clients           # Client master data
├── paperSizes        # Paper size configurations
├── notebookTypes     # Notebook type definitions
├── calculationRules  # Pricing calculation rules
├── teams             # Team management
├── users             # User accounts
├── roles             # User roles and permissions
└── systemSettings    # System configuration
```

## 🔄 Enhanced Business Workflow

### 1. Enhanced Binding Advice Creation

- Create binding advice with dynamic product mapping from inventory
- Automatic value calculations based on finished product rates
- Line items with real-time calculations for reams and sheets
- Company details mapping from system settings
- System automatically reserves required raw materials

### 2. Automated Job Card Generation

- Convert approved binding advice to job cards with material mapping
- Automatic job card creation from production plans
- Track production through stages: Design → Planning → Production → Quality → Completion
- Real-time progress tracking with stage management
- Material allocation and consumption tracking

### 3. Advanced Inventory Management

- **Raw Materials**: Track paper, binding materials with specifications
- **Finished Products**: Track completed notebooks with selling prices and production costs
- **Work in Progress**: Monitor active production items
- **Enhanced Overview**: 5-card dashboard with value calculations
- **Binding Advice Integration**: Calculate finished product values from orders
- **Reservations**: Automatic reservation when binding advice is created
- **Consumption**: Track material usage during production

### 4. Dynamic Production Process

- Fully dynamic CRUD operations for production planning
- Start production from job cards with material mapping
- Consume reserved raw materials automatically
- Generate finished products with proper inventory updates
- Real-time inventory synchronization

### 5. Smart Dispatch & Invoicing

- Job card mapping for dispatch with automatic data population
- Multi-location delivery support
- Automated invoice generation based on binding advice
- Line item mapping with calculated values
- Quality check completed products
- Generate delivery documents and invoices

### 6. Calculation Management

- Save calculations to JSON server with metadata
- Version control for calculation rules
- Enhanced calculation storage with variables and formulas
- Real-time calculation updates

## 🎯 Advanced Features Explained

### Enhanced Inventory System

**Product Mapping & Value Calculations:**

- Dynamic product mapping in binding advice line items
- Automatic rate calculation from inventory selling prices
- Real-time value calculations with immediate updates
- Finished product matching with stock level indicators

**Advanced Inventory Overview:**

- 5-card dashboard: Raw Materials, Finished Products, Work in Progress, Low Stock, Total Value
- Real-time inventory worth calculations
- Binding advice integration for finished product values
- Enhanced categorization and filtering

### Dynamic Job Card Management

**Automated Creation:**

- Job cards automatically created from production plans
- Material mapping from binding advice line items
- Multi-stage workflow with progress tracking
- Resource allocation and consumption tracking

**Production Integration:**

- Real-time material consumption updates
- Finished product generation with inventory updates
- Quality control stage management
- Completion tracking with produced quantities

### Smart Invoice Generation

**Binding Advice Integration:**

- Automatic invoice generation from binding advice
- Line item mapping with calculated values
- Dynamic rate calculation from finished products
- Company details integration from system settings

**Enhanced Calculations:**

- Real-time total calculations
- Tax management and payment terms
- Multiple line items support
- Automatic due date calculation

### Calculation Center

**Enhanced Storage:**

- Save calculations to JSON server with full metadata
- Version control and calculation history
- Variable and formula storage
- Result tracking with efficiency metrics

### React Query Integration

- **Optimistic Updates**: UI updates immediately, syncs with server
- **Background Refetching**: Keeps data fresh automatically
- **Error Handling**: Robust error handling with retry logic
- **Caching**: Intelligent caching reduces API calls
- **Real-time Synchronization**: Cross-module data updates
- **Mutation Management**: Proper create, update, delete operations

## 🔐 User Management

### Roles & Permissions

- **Admin**: Full system access
- **Manager**: Production and inventory management
- **Operator**: Limited production operations
- **Viewer**: Read-only access

### System Settings

- Company information
- Email configuration
- System preferences
- User management

## 📊 Reports & Analytics

- Production reports
- Inventory reports
- Financial reports
- Custom date range filtering
- Export capabilities

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run server` - Start JSON server
- `npm run dev:full` - Start both frontend and backend
- `npm run preview` - Preview production build

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent code formatting
- Component-based architecture

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3002
VITE_APP_NAME=Madura ERP
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. NaN Values in Table Cells

**Issue**: React warning "Received NaN for the `children` attribute"
**Solution**:

- Ensure all numeric calculations have proper validation
- Check that data interfaces match the actual API response format
- Verify that calculation functions return valid numbers

#### 2. JSON Server Port Conflicts

**Issue**: "EADDRINUSE: address already in use :::3001"
**Solution**:

```bash
# Use a different port
npx json-server --watch db.json --port 3002

# Update .env file
VITE_API_BASE_URL=http://localhost:3002
```

#### 3. API Connection Issues

**Issue**: API calls failing or returning 404
**Solution**:

- Verify JSON server is running: `http://localhost:3002`
- Check `.env` file has correct API base URL
- Ensure `db.json` is valid JSON format

#### 4. Build Errors

**Issue**: TypeScript compilation errors
**Solution**:

- Run `npm run typecheck` to identify type issues
- Ensure all interfaces match the actual data structure
- Check for missing properties in entity definitions

#### 5. Data Not Loading

**Issue**: Components show loading state indefinitely
**Solution**:

- Check browser console for API errors
- Verify JSON server endpoints are accessible
- Check React Query DevTools for query status

### Development Tips

1. **Use React Query DevTools** for debugging API state
2. **Check browser console** for detailed error messages
3. **Validate JSON** before updating `db.json`
4. **Use TypeScript strictly** to catch interface mismatches early
5. **Test API endpoints** directly before implementing in components

### JSON Server Configuration

The `db.json` file contains sample data for all entities. Modify this file to change initial data.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is proprietary software developed for Madura Papers.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v3.0.0** - Enhanced product mapping, dynamic job card creation, automated invoice generation, calculation storage, advanced inventory management with finished product integration
- **v2.0.0** - React Query integration, Axios implementation, Advanced inventory management
- **v1.0.0** - Initial release with basic ERP functionality

## 🆕 Latest Updates (v3.0.0)

### New Features

- **Product Mapping in Binding Advice**: Dynamic product mapping with value calculations
- **Automated Job Card Creation**: Job cards created from production plans with material mapping
- **Enhanced Inventory Overview**: 5-card dashboard with finished product calculations
- **Smart Invoice Generation**: Automated invoice creation based on binding advice
- **Calculation Storage**: Save calculations to JSON server with metadata
- **Dynamic CRUD Operations**: Full CRUD operations across all modules
- **Real-time Updates**: Immediate screen updates with optimistic mutations

### Technical Improvements

- Enhanced React Query integration with proper mutation handling
- Improved type safety with comprehensive TypeScript interfaces
- Better error handling and loading states
- Optimized performance with intelligent caching
- Cross-module data synchronization
- Production-ready build optimization

### Bug Fixes

- Fixed calculation page runtime errors
- Resolved type errors across all components
- Enhanced null safety and error handling
- Improved form validation and data integrity

---

**Built with ❤️ for Madura Papers**
