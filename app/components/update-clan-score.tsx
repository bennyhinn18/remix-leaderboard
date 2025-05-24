import { useFetcher } from '@remix-run/react';

export default function UpdateClanScoreButton() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/api/update-clan-score">
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Clan Scores
      </button>
      {fetcher.state === 'submitting' && <p>Updating...</p>}
    </fetcher.Form>
  );
}
