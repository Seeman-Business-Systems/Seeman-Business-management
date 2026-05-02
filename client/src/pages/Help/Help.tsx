import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout';
import usePageTitle from '../../hooks/usePageTitle';
import helpContent from './helpContent';

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<mark class="bg-yellow-100 text-yellow-900 rounded px-0.5">${text.slice(idx, idx + query.length)}</mark>` +
    text.slice(idx + query.length)
  );
}

function Help() {
  usePageTitle('Help');

  const [search, setSearch] = useState('');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return helpContent;
    return helpContent
      .map((mod) => ({
        ...mod,
        questions: mod.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((mod) => mod.questions.length > 0);
  }, [q]);

  const toggleModule = (id: string) =>
    setOpenModules((s) => ({ ...s, [id]: !s[id] }));

  const toggleQuestion = (key: string) =>
    setOpenQuestions((s) => ({ ...s, [key]: !s[key] }));

  const isModuleOpen = (id: string) =>
    q ? true : (openModules[id] ?? false);

  const isQuestionOpen = (key: string) =>
    q ? true : (openQuestions[key] ?? false);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Answers to common questions about using Seeman.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Results count when searching */}
        {q && (
          <p className="text-sm text-gray-500 -mt-2">
            {filtered.reduce((n, m) => n + m.questions.length, 0)} result
            {filtered.reduce((n, m) => n + m.questions.length, 0) !== 1 ? 's' : ''} for{' '}
            <span className="font-medium text-gray-800">"{search}"</span>
          </p>
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-circle-question text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500 font-medium">No results found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
          </div>
        )}

        {/* Module accordions */}
        <div className="space-y-3">
          {filtered.map((mod) => {
            const modOpen = isModuleOpen(mod.id);
            return (
              <div
                key={mod.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <i className={`fa-solid ${mod.icon} text-sm text-indigo-600`} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{mod.label}</span>
                      <span className="ml-2 text-xs text-gray-400">{mod.questions.length} questions</span>
                    </div>
                  </div>
                  <i
                    className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${modOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Questions */}
                {modOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {mod.questions.map((item, qi) => {
                      const key = `${mod.id}-${qi}`;
                      const qOpen = isQuestionOpen(key);
                      return (
                        <div key={key}>
                          <button
                            onClick={() => toggleQuestion(key)}
                            className="w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <span
                              className="text-sm font-medium text-gray-800 pr-4"
                              dangerouslySetInnerHTML={{ __html: highlight(item.q, search) }}
                            />
                            <i
                              className={`fa-solid fa-plus text-xs text-gray-400 flex-shrink-0 transition-transform duration-200 ${qOpen ? 'rotate-45' : ''}`}
                            />
                          </button>
                          {qOpen && (
                            <div className="px-5 pb-4">
                              <p
                                className="text-sm text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlight(item.a, search) }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default Help;
