import React from "react";

export default function DocumentsBlock({ documentPages, setDocumentPages }) {
    return (
        <div className="rounded-2xl border bg-white p-4">
            <h4 className="font-semibold text-gray-900">Documents</h4>
            <p className="subtext text-xs text-gray-600 mt-1">Weight is not used for document pricing.</p>

            <div className="mt-3">
                <label className="subtext text-xs text-gray-600">Number of pages</label>
                <input
                    type="number"
                    value={documentPages}
                    onChange={(e) => setDocumentPages(e.target.value)}
                    className="mt-1 w-full p-3 border border-gray-300 rounded-xl bg-white"
                />
            </div>
        </div>
    );
}
