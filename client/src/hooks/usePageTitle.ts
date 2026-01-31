import { useEffect } from 'react';

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `Seeman | ${title}`;
  }, [title]);
}

export default usePageTitle;
