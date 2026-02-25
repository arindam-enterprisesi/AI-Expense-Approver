
/**
 * Navbar component provides navigation and user role switching.
 *
 * Props:
 *  - currentUser: UserRole ('employee' or 'admin')
 *  - setCurrentUser: Callback to switch user role
 *
 * Features:
 *  - Shows app title, user role, and allows switching between employee/admin
 *  - Used at the top of all main pages
 */
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/pages/Index';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentUser: UserRole;
  setCurrentUser: (role: UserRole) => void;
}

export function Navbar({ currentUser, setCurrentUser }: NavbarProps) {
  const navigate = useNavigate();
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/dashboard', { replace: true })} className="flex items-center gap-2">
              <img src="/ai-expense-approver logo.ico" alt="Logo" className="h-8 w-8" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Expense Approver</h1>
              <p className="text-xs text-gray-500">Smart Expense Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={currentUser === 'employee' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentUser('employee')}
                className={`${
                  currentUser === 'employee' 
                    ? 'bg-[#5ABA47] hover:bg-[#4a9c3a]' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <User className="h-4 w-4 mr-1" />
                Employee
              </Button>
              <Button
                variant={currentUser === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentUser('admin')}
                className={`${
                  currentUser === 'admin' 
                    ? 'bg-[#5ABA47] hover:bg-[#4a9c3a]' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#5ABA47] rounded-full flex items-center justify-center">
                {currentUser === 'employee' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Shield className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {currentUser === 'employee' ? 'John Doe' : 'Admin Panel'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
