import { Upload } from 'lucide-react';
import { ComponentDefinition } from '../../types';

const UploadField: ComponentDefinition = {
  Component: ({ element }) => (
    <div className="mt-1 flex-1 flex justify-center items-center px-6 border-2 border-gray-300 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <span className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
            Upload a file
          </span>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          {element.accept === '*/*' ? 'Any file type' : element.accept}
        </p>
      </div>
    </div>
  ),
  name: 'Upload',
  fieldType: 'upload',
  description: 'Send Documents and Media files.',
  icon: Upload,
  layout: { defaultW: 6, defaultH: 6, minW: 4, minH: 5 },
  defaultProps: {
    label: 'New Upload Field',
    accept: '*/*',
    multiple: false,
    required: false,
  },
};

export default UploadField;
