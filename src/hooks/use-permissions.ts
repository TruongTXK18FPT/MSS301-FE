'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserRole, Permission } from '@/types/classroom';

export function usePermissions(): Permission {
  const { role } = useAuth();
  
  return useMemo(() => {
    const userRole = role as UserRole;
    
    switch (userRole) {
      case 'TEACHER':
        return {
          canCreateClassroom: true,
          canManageStudents: true,
          canCreateAssignments: true,
          canCreateQuizzes: true,
          canViewAllClassrooms: true,
          canJoinClassrooms: false,
          canSubmitAssignments: false,
          canTakeQuizzes: false,
        };
        
      case 'STUDENT':
        return {
          canCreateClassroom: false,
          canManageStudents: false,
          canCreateAssignments: false,
          canCreateQuizzes: false,
          canViewAllClassrooms: false,
          canJoinClassrooms: true,
          canSubmitAssignments: true,
          canTakeQuizzes: true,
        };
        
      case 'GUARDIAN':
        return {
          canCreateClassroom: false,
          canManageStudents: false,
          canCreateAssignments: false,
          canCreateQuizzes: false,
          canViewAllClassrooms: false,
          canJoinClassrooms: true,
          canSubmitAssignments: false,
          canTakeQuizzes: false,
        };
        
      default:
        return {
          canCreateClassroom: false,
          canManageStudents: false,
          canCreateAssignments: false,
          canCreateQuizzes: false,
          canViewAllClassrooms: false,
          canJoinClassrooms: false,
          canSubmitAssignments: false,
          canTakeQuizzes: false,
        };
    }
  }, [role]);
}
