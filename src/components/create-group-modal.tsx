'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, X, Search, User } from "lucide-react";

interface CreateGroupForm {
  name: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface CreateGroupModalProps {
  trigger?: React.ReactNode;
  onGroupCreated?: (group: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ 
  trigger, 
  onGroupCreated 
}) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [createForm, setCreateForm] = useState<CreateGroupForm>({
    name: '',
    description: ''
  });

  // Debounced user search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const users = await response.json();
          // Filter out already selected users
          const filteredUsers = users.filter(
            (user: User) => !selectedUsers.some(selected => selected.id === user.id)
          );
          setSearchResults(filteredUsers);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof CreateGroupForm, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setShowDropdown(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/groups/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description || null,
          memberIds: selectedUsers.map(user => user.id) // Include selected user IDs
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create group');
      }

      const newGroup = await response.json();
      
      // Call the callback if provided
      if (onGroupCreated) {
        onGroupCreated(newGroup);
      }
      
      // Reset form and close dialog
      setCreateForm({ name: '', description: '' });
      setSelectedUsers([]);
      setSearchQuery('');
      setIsDialogOpen(false);
      
      // Navigate to the new group
      router.push(`/dashboard/groups/${newGroup.id}`);
      
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Group
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to split expenses with friends, family, or colleagues.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              placeholder="e.g., Trip to Paris, Roommate Expenses"
              value={createForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              placeholder="Add a description for your group..."
              value={createForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* User Search Section */}
          <div className="space-y-2">
            <Label htmlFor="userSearch">Add Members (Optional)</Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userSearch"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 px-3 py-2 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Selected Members:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                    >
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-5 h-5 rounded-full" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !createForm.name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
