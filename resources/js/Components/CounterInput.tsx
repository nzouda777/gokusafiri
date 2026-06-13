interface Props {
    label: string;
    sublabel?: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
}

export default function CounterInput({ label, sublabel, value, min = 0, max = 20, onChange }: Props) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-[#1F2937]">{label}</p>
                {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-[#1F2937] hover:border-[#2C4A3B] hover:text-[#2C4A3B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-light"
                >
                    −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-[#1F2937]">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-[#1F2937] hover:border-[#2C4A3B] hover:text-[#2C4A3B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-light"
                >
                    +
                </button>
            </div>
        </div>
    );
}
