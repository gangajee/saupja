"use client";

interface Props {
  onSelect: (postcode: string, address: string) => void;
}

export default function PostcodeSearch({ onSelect }: Props) {
  function handleClick() {
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).daum.Postcode({
        oncomplete(data: { zonecode: string; roadAddress: string; jibunAddress: string }) {
          onSelect(data.zonecode, data.roadAddress || data.jibunAddress);
        },
      }).open();
    };
    if (!(window as any).daum?.Postcode) {
      document.head.appendChild(script);
    } else {
      script.onload?.(new Event("load"));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shrink-0 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition whitespace-nowrap"
    >
      주소 검색
    </button>
  );
}