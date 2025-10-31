interface PromoInputProps {
  promo: string;
  setPromo: (value: string) => void;
  onApply: () => void;
  applying: boolean;
  status: {
    message: string;
    type: 'success' | 'error' | '';
  };
}

export default function PromoInput({ promo, setPromo, onApply, applying, status }: PromoInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Promo Code"
          className="bg-[#DDDDDD] flex-1 px-3 py-2 rounded-md hover:outline-none focus:outline-none "
        />
        <button
          onClick={onApply}
          disabled={applying}
          className={`px-4 py-2 text-white rounded-md ${
            applying 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#161616] '
          }`}
        >
          {applying ? 'Applying...' : 'Apply'}
        </button>
      </div>
      
      {status.message && (
        <p className={`text-sm ${
          status.type === 'success' 
            ? 'text-green-600' 
            : status.type === 'error' 
              ? 'text-red-600' 
              : ''
        }`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
