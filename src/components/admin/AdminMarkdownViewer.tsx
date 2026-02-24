import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
// @ts-ignore
import masterPrompt from '../../assets/MasterPrompt.md?raw';
// @ts-ignore
import sow from '../../assets/SOW.md?raw';
// @ts-ignore
import travelPolicy from '../../assets/TravelExpensePolicy.md?raw';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const markdownFiles = [
  { label: 'Master Prompt', value: 'master', content: masterPrompt },
  { label: 'SOW', value: 'sow', content: sow },
  { label: 'Travel Expense Policy', value: 'policy', content: travelPolicy },
];


const markdownComponents = {
  h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-2 border-b pb-2" {...props} />,
  h2: (props) => <h2 className="text-xl font-semibold mt-5 mb-2 border-b pb-1" {...props} />,
  h3: (props) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
  h4: (props) => <h4 className="text-base font-semibold mt-3 mb-1" {...props} />,
  p: (props) => <p className="my-2 leading-relaxed" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 pl-4 italic text-gray-600 my-4" {...props} />,
  a: (props) => <a className="text-blue-600 underline" {...props} />,
  code: ({inline, className, children, ...props}) =>
    inline
      ? <code className="bg-gray-100 rounded px-1" {...props}>{children}</code>
      : <pre className="bg-gray-100 rounded p-2 my-2 overflow-x-auto"><code {...props}>{children}</code></pre>,
};

const AdminMarkdownViewer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-4xl mx-auto">
        <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="fixed mt-[50px] top-4 left-4 border border-[#5ABA47] text-[#5ABA47] hover:bg-[#5ABA47] hover:text-white shadow-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="shadow-lg border border-gray-200 bg-white">
        <Tabs defaultValue={markdownFiles[0].value} className="w-full">
          <TabsList className="mb-2 flex gap-2 bg-gray-50 p-2 rounded-t-lg border-b border-gray-200">
            {markdownFiles.map((file) => (
              <TabsTrigger
                key={file.value}
                value={file.value}
                className="px-4 py-2 text-base font-medium rounded-md data-[state=active]:bg-[#5ABA47] data-[state=active]:text-white data-[state=active]:shadow"
              >
                {file.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {markdownFiles.map((file) => (
            <TabsContent key={file.value} value={file.value}>
              <div className="prose prose-slate max-w-none mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-auto" style={{maxHeight: '90vh'}}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                  skipHtml={false}
                >
                  {String(file.content)}
                </ReactMarkdown>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminMarkdownViewer;
