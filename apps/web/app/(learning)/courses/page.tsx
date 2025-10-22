import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';

const courses = [
  {
    name: 'Cultural capability foundations',
    duration: '45 minutes',
    status: 'Mandatory for all crew',
    due: '30/06/2024'
  },
  {
    name: 'Supervisor essentials',
    duration: '90 minutes',
    status: 'Recommended for aspiring leaders',
    due: '31/07/2024'
  }
];

export default function CoursesPage() {
  return (
    <div className="space-y-6" aria-label="Learning catalogue">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Learning catalogue</h1>
          <p className="text-slate-600">Assign learning pathways and monitor completions.</p>
        </div>
        <Button>Create course</Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.name}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>{course.status}</CardDescription>
            </CardHeader>
            <dl className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>Duration</dt>
                <dd>{course.duration}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Due by</dt>
                <dd>{course.due}</dd>
              </div>
            </dl>
            <Button variant="secondary" className="mt-4 w-full">
              Assign learners
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
