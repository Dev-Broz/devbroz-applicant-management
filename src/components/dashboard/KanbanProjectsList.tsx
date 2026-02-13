import { Calendar, Users, Trash2, ArrowRight } from 'lucide-react';
import { KanbanProject } from '@/types/applicant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface KanbanProjectsListProps {
  projects: KanbanProject[];
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

/**
 * Format project date - handles both ISO strings and Firebase Timestamps
 */
function formatProjectDate(date: any): string {
  try {
    // If it's a Firebase Timestamp object with _seconds
    if (date && typeof date === 'object' && '_seconds' in date) {
      return format(new Date(date._seconds * 1000), 'MMM d, yyyy');
    }
    
    // If it's an ISO string or Date object
    if (date) {
      return format(new Date(date), 'MMM d, yyyy');
    }
    
    return 'Unknown date';
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Unknown date';
  }
}

export function KanbanProjectsList({
  projects,
  onSelectProject,
  onDeleteProject,
}: KanbanProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Kanban Projects</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Select candidates from the Talent Pool or Work With Us tables and click "Create Kanban Project" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {formatProjectDate(project.createdAt)}
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteProject(project.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {project.applicantIds.length} candidate{project.applicantIds.length !== 1 ? 's' : ''}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectProject(project.id)}
                className="text-primary hover:text-primary/80"
              >
                Open
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
