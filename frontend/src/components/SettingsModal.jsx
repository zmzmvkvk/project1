import React, { useState } from 'react';
import Modal from 'react-modal';

// 모달의 스타일을 정의합니다.
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1F2937', // bg-gray-800
    border: '1px solid #4B5563', // border-gray-600
    borderRadius: '0.5rem', // rounded-lg
    color: 'white',
    width: '90%',
    maxWidth: '500px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
};

// 앱의 루트 엘리먼트를 지정하여 스크린 리더기 접근성을 향상시킵니다.
Modal.setAppElement('#root');

const SettingsModal = ({ isOpen, onRequestClose, onSubmit, isLoading }) => {
  const [topic, setTopic] = useState("A brave lion becomes king of the savanna");
  const [platform, setPlatform] = useState('youtube');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ topic, platform });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Story Generation Settings"
    >
      <h2 className="text-2xl font-bold mb-6">AI 스토리 생성 설정</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
            주제 (Topic)
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            플랫폼 (Platform)
          </label>
          <div className="flex space-x-4">
            {['youtube', 'tiktok', 'instagram'].map((p) => (
              <label key={p} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  value={p}
                  checked={platform === p}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="capitalize">{p}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onRequestClose}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '스토리 생성'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;