'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Users, Receipt, DollarSign, Calendar, Loader2 } from "lucide-react";

type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  splitType: SplitType;
  paidByUserId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  assignedAt: string;
  user: User;
}

interface ExpenseSplit {
  id: string;
  userId: string;
  amountOwed: number;
  user: User;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  date: string;
  splitType: SplitType;
  paidBy: User;
  paidByUserId: string;
  createdBy: User;
  createdByUserId: string;
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  members: GroupMember[];
  expenses: Expense[];
  _count: {
    expenses: number;
    settlements: number;
  };
}

const GroupDetailPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const groupId = params.id as string;

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'EQUAL',
    paidByUserId: ''
  });

  // Fetch group data from API
  useEffect(() => {
    const fetchGroupData = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setError(null);
        const response = await fetch(`/api/groups/${groupId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Group not found');
          } else if (response.status === 401) {
            setError('Unauthorized access');
          } else {
            setError('Failed to load group data');
          }
          return;
        }
        
        const data: GroupData = await response.json();
        setGroupData(data);
        
        // Set the first member as default payer
        if (data.members.length > 0) {
          setExpenseForm(prev => ({ 
            ...prev, 
            paidByUserId: data.members[0].user.id 
          }));
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
        setError('Failed to load group data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, status]);

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupData) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add expense');
      }

      const newExpense = await response.json();

      // Update the group data with the new expense
      setGroupData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          expenses: [newExpense, ...prev.expenses],
          _count: {
            ...prev._count,
            expenses: prev._count.expenses + 1,
          },
        };
      });

      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        splitType: 'EQUAL',
        paidByUserId: groupData.members[0]?.user.id || ''
      });

      // Show success message (you can replace with a toast notification)
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert(error instanceof Error ? error.message : 'Error adding expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading group details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Unauthorized</h1>
          <p className="text-muted-foreground mt-2">Please log in to view this group.</p>
        </div>
      </div>
    );
  }

  if (error || !groupData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            {error || 'Group not found'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {error === 'Group not found' 
              ? "The group you're looking for doesn't exist or you don't have access to it."
              : "There was an error loading the group data. Please try again."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{groupData.name}</h1>
            {groupData.description && (
              <p className="text-muted-foreground mt-2">{groupData.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{groupData.members.length} members</span>
          </div>
        </div>
        
        {/* Group Members */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Members</h3>
          <div className="flex flex-wrap gap-2">
            {groupData.members.map((member, idx) => (
              <div 
                key={idx}
                className="bg-background border rounded-full px-3 py-1 text-sm"
              >
                {member.user.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Expense
          </CardTitle>
          <CardDescription>
            Add an expense to be split among group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="e.g., Dinner at restaurant"
                  value={expenseForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value: string) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              {/* Paid By */}
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By</Label>
                <Select
                  value={expenseForm.paidByUserId}
                  onValueChange={(value: string) => handleInputChange('paidByUserId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupData.members.map((member, idx) => (
                      <SelectItem key={idx} value={member.user.id}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Split Type */}
              <div className="space-y-2">
                <Label htmlFor="splitType">Split Type</Label>
                <Select
                  value={expenseForm.splitType}
                  onValueChange={(value: string) => handleInputChange('splitType', value as SplitType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQUAL">Equal Split</SelectItem>
                    <SelectItem value="UNEQUAL">Unequal Split</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Latest expenses in this group ({groupData._count.expenses} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupData.expenses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No expenses yet. Add your first expense above!
            </div>
          ) : (
            <div className="space-y-4">
              {groupData.expenses.slice(0, 5).map((expense, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{expense.description}</h4>
                      {expense.category && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {expense.category}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Paid by {expense.paidBy.name} • {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {expense.splitType.toLowerCase()} split
                    </div>
                  </div>
                </div>
              ))}
              {groupData.expenses.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Expenses ({groupData.expenses.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDetailPage;