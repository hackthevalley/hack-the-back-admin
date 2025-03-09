interface ApplicantProps {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function Applicant({
  first_name,
  last_name,
  email,
  status,
  created_at,
  updated_at,
}: ApplicantProps) {
  return (
    <div className="flex m-4">
      <div className="flex flex-col gap-1">
        {first_name} {last_name}
        <div className="py-0.5 px-2 bg-primary rounded-sm text-sm">{email}</div>
      </div>
    </div>
  );
}

export default Applicant;
