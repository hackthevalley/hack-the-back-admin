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
    <div className="flex m-4 justify-between w-full h-min border-2 border-gray-200 p-2 items-center">
      <div className="flex flex-col gap-1">
        {first_name} {last_name}
        <div className="py-0.5 px-2 bg-primary rounded-sm text-sm">{email}</div>
      </div>
      <div className="">{status}</div>
      <div>{created_at}</div>
      <div>{updated_at}</div>
      <button className="bg-primary text-white px-2 py-1 rounded-sm">
        View
      </button>
    </div>
  );
}

export default Applicant;
