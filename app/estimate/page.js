import EstimatePanel from "@/components/EstimatePanel";

export default function EstimatePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Estimate a Listing</h1>
        <p className="text-sm text-graphite-500">
          Paste a parts list or listing description, then check eBay sold prices for each
          detected item to build an accurate total.
        </p>
      </div>
      <EstimatePanel />
    </div>
  );
}