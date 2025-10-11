/**
 * Modal & Toast Example Component
 *
 * Purpose: Demonstrate how to use the new Modal and Toast components in admin pages
 * Based on: Website LaunchModal design
 *
 * Usage:
 * ```tsx
 * import { ModalToastExample } from '@/components/admin/examples/ModalToastExample';
 *
 * // In your admin page:
 * <ModalToastExample />
 * ```
 *
 * Features Demonstrated:
 * - ✅ Modal (primary, success, warning, danger variants)
 * - ✅ ConfirmDialog (delete confirmation)
 * - ✅ InfoDialog (success messages)
 * - ✅ Toast (success, error, warning, info)
 * - ✅ useToast hook
 */

'use client';

import React, { useState } from 'react';
import { Modal, ConfirmDialog, InfoDialog } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/admin/ui/Toast';

export function ModalToastExample() {
  const toast = useToast();

  // Modal states
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);

  // ConfirmDialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // InfoDialog states
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Custom background states
  const [isCustomBgModalOpen, setIsCustomBgModalOpen] = useState(false);
  const [isCustomHeaderModalOpen, setIsCustomHeaderModalOpen] = useState(false);
  const [isCustomBackdropModalOpen, setIsCustomBackdropModalOpen] = useState(false);

  // Delete confirmation handler
  const handleDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    // Show success toast
    toast.showSuccess('삭제 완료', '공지사항이 성공적으로 삭제되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal & Toast 사용 예시</h1>
        <p className="text-gray-600">
          웹사이트 LaunchModal 디자인이 반영된 어드민 컴포넌트입니다. 아래 버튼을 클릭하여 각 컴포넌트를 테스트해보세요.
        </p>
      </div>

      {/* Modal Examples */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Modal 컴포넌트</h2>
        <p className="text-gray-600 mb-6">다양한 variant의 Modal을 사용할 수 있습니다 (primary, success, warning, danger, info).</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setIsPrimaryModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Primary Modal
          </button>

          <button
            onClick={() => setIsSuccessModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Success Modal
          </button>

          <button
            onClick={() => setIsWarningModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Warning Modal
          </button>

          <button
            onClick={() => setIsDangerModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Danger Modal
          </button>
        </div>
      </div>

      {/* ConfirmDialog Example */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">2. ConfirmDialog 컴포넌트</h2>
        <p className="text-gray-600 mb-6">사용자 확인이 필요한 작업 (삭제, 제출 등)에 사용합니다. 로딩 상태를 지원합니다.</p>

        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          공지사항 삭제 (예시)
        </button>
      </div>

      {/* InfoDialog Example */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">3. InfoDialog 컴포넌트</h2>
        <p className="text-gray-600 mb-6">정보 전달용 다이얼로그입니다. 아이콘과 함께 메시지를 표시합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setIsSuccessDialogOpen(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            성공 메시지
          </button>

          <button
            onClick={() => setIsErrorDialogOpen(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            에러 메시지
          </button>
        </div>
      </div>

      {/* Toast Example */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Toast 컴포넌트</h2>
        <p className="text-gray-600 mb-6">
          비침투적 알림 메시지입니다. useToast 훅을 사용하여 호출합니다. 자동으로 사라지며, 수동으로 닫을 수도 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => toast.showSuccess('성공!', '작업이 성공적으로 완료되었습니다.')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Success Toast
          </button>

          <button
            onClick={() => toast.showError('에러 발생', '작업 중 오류가 발생했습니다.')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Error Toast
          </button>

          <button
            onClick={() => toast.showWarning('주의 필요', '이 작업은 되돌릴 수 없습니다.')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Warning Toast
          </button>

          <button
            onClick={() => toast.showInfo('정보', '새로운 업데이트가 있습니다.')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Info Toast
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() =>
              toast.showInfo('영구 토스트', '닫기 버튼을 눌러야만 사라집니다.', 0)
            }
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            영구 Toast (자동 닫기 없음)
          </button>
        </div>
      </div>

      {/* Custom Background Examples */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">5. 커스텀 배경 색상</h2>
        <p className="text-gray-600 mb-6">
          headerClassName, bodyClassName, backdropClassName props를 사용하여 자유롭게 배경색과 스타일을 변경할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setIsCustomHeaderModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            커스텀 헤더 배경
          </button>

          <button
            onClick={() => setIsCustomBgModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            커스텀 본문 배경
          </button>

          <button
            onClick={() => setIsCustomBackdropModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            커스텀 백드롭
          </button>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 rounded-xl shadow-sm p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">코드 예시</h2>

        <div className="space-y-6">
          {/* Toast Usage */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Toast 사용법</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
              {`import { useToast } from '@/components/admin/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await saveData();
      toast.showSuccess('저장 완료', '데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      toast.showError('저장 실패', error.message);
    }
  };

  return <button onClick={handleSubmit}>저장</button>;
}`}
            </pre>
          </div>

          {/* ConfirmDialog Usage */}
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-3">ConfirmDialog 사용법</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
              {`import { ConfirmDialog } from '@/components/admin/ui/Modal';

const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  await deleteItem();
  setIsDeleting(false);
  setIsDeleteDialogOpen(false);
};

return (
  <>
    <button onClick={() => setIsDeleteDialogOpen(true)}>삭제</button>

    <ConfirmDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={handleDelete}
      title="정말 삭제하시겠습니까?"
      message="이 작업은 되돌릴 수 없습니다."
      variant="danger"
      isLoading={isDeleting}
    />
  </>
);`}
            </pre>
          </div>

          {/* Modal Usage */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Modal 사용법</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
              {`import { Modal } from '@/components/admin/ui/Modal';

const [isModalOpen, setIsModalOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsModalOpen(true)}>모달 열기</button>

    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="제목"
      description="부제목 (선택사항)"
      variant="primary" // primary, success, warning, danger, info
      size="md" // sm, md, lg, xl, full
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsModalOpen(false)}>취소</button>
          <button onClick={handleSave}>저장</button>
        </div>
      }
    >
      <p>모달 내용</p>
    </Modal>
  </>
);`}
            </pre>
          </div>

          {/* Custom Background Usage */}
          <div>
            <h3 className="text-lg font-semibold text-pink-400 mb-3">커스텀 배경 색상 사용법</h3>
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
              {`import { Modal } from '@/components/admin/ui/Modal';

// 1. 커스텀 헤더 배경 (그라데이션 대신 단색)
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="커스텀 헤더"
  headerClassName="relative bg-pink-600 text-white p-8 rounded-t-2xl"
>
  <p>핑크색 헤더 배경</p>
</Modal>

// 2. 커스텀 본문 배경 (기본 흰색 대신)
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="커스텀 본문"
  bodyClassName="p-8 bg-gradient-to-br from-blue-50 to-cyan-50"
>
  <p>파란색 그라데이션 본문</p>
</Modal>

// 3. 커스텀 백드롭 (블러 없이 반투명)
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="커스텀 백드롭"
  backdropClassName="fixed inset-0 bg-purple-900/80 z-50 animate-fade-in"
>
  <p>보라색 백드롭</p>
</Modal>

// 4. 모든 배경 커스텀
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="완전 커스텀"
  headerClassName="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-t-2xl"
  bodyClassName="p-8 bg-amber-50"
  backdropClassName="fixed inset-0 bg-black/80 z-50"
>
  <p>완전히 커스터마이징된 모달</p>
</Modal>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isPrimaryModalOpen}
        onClose={() => setIsPrimaryModalOpen(false)}
        title="Primary Modal"
        description="기본 테마의 모달입니다"
        variant="primary"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsPrimaryModalOpen(false)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              닫기
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all">
              확인
            </button>
          </div>
        }
      >
        <p className="text-gray-700 leading-relaxed">
          Primary 테마는 주요 작업 (생성, 수정 등)에 사용합니다. 그라데이션 헤더와 애니메이션 효과가 적용되어 있습니다.
        </p>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success Modal"
        description="성공을 나타내는 모달입니다"
        variant="success"
      >
        <p className="text-gray-700 leading-relaxed">성공적으로 작업이 완료되었을 때 사용하는 모달입니다.</p>
      </Modal>

      <Modal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        title="Warning Modal"
        description="주의가 필요한 작업입니다"
        variant="warning"
      >
        <p className="text-gray-700 leading-relaxed">사용자에게 주의를 환기시켜야 할 때 사용합니다.</p>
      </Modal>

      <Modal
        isOpen={isDangerModalOpen}
        onClose={() => setIsDangerModalOpen(false)}
        title="Danger Modal"
        description="위험한 작업입니다"
        variant="danger"
      >
        <p className="text-gray-700 leading-relaxed">삭제와 같은 위험한 작업을 수행할 때 사용합니다.</p>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="공지사항을 삭제하시겠습니까?"
        message="삭제된 공지사항은 복구할 수 없습니다. 정말 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={isDeleting}
      />

      <InfoDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        title="저장 완료"
        message="모든 변경사항이 성공적으로 저장되었습니다."
        variant="success"
        icon="success"
        buttonText="확인"
      />

      <InfoDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        title="오류 발생"
        message="작업 중 오류가 발생했습니다. 다시 시도해주세요."
        variant="danger"
        icon="error"
        buttonText="확인"
      />

      {/* Custom Background Modals */}
      <Modal
        isOpen={isCustomHeaderModalOpen}
        onClose={() => setIsCustomHeaderModalOpen(false)}
        title="커스텀 헤더 배경"
        description="핑크 → 퍼플 그라데이션 헤더"
        headerClassName="relative bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setIsCustomHeaderModalOpen(false)}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all"
            >
              닫기
            </button>
          </div>
        }
      >
        <p className="text-gray-700 leading-relaxed">
          <strong>headerClassName</strong> prop을 사용하여 헤더 배경을 자유롭게 변경할 수 있습니다.
          기본 그라데이션 대신 원하는 색상이나 패턴을 적용하세요.
        </p>
        <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <code className="text-sm text-pink-800">
            headerClassName="relative bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-8 rounded-t-2xl"
          </code>
        </div>
      </Modal>

      <Modal
        isOpen={isCustomBgModalOpen}
        onClose={() => setIsCustomBgModalOpen(false)}
        title="커스텀 본문 배경"
        description="그라데이션 본문 배경"
        variant="info"
        bodyClassName="p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setIsCustomBgModalOpen(false)}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium rounded-lg shadow-lg transition-all"
            >
              닫기
            </button>
          </div>
        }
      >
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>bodyClassName</strong> prop을 사용하여 본문 배경을 변경할 수 있습니다.
          기본 흰색 배경 대신 그라데이션이나 색상을 적용하세요.
        </p>
        <div className="p-6 bg-white/60 backdrop-blur-sm border border-teal-200 rounded-lg">
          <h4 className="font-semibold text-teal-900 mb-2">예시 카드</h4>
          <p className="text-teal-700 text-sm">배경이 투명한 카드를 사용하여 그라데이션 효과를 활용할 수 있습니다.</p>
        </div>
        <div className="mt-4 p-4 bg-white border border-cyan-200 rounded-lg">
          <code className="text-sm text-cyan-800">
            bodyClassName="p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50"
          </code>
        </div>
      </Modal>

      <Modal
        isOpen={isCustomBackdropModalOpen}
        onClose={() => setIsCustomBackdropModalOpen(false)}
        title="커스텀 백드롭"
        description="호박색 백드롭"
        variant="warning"
        backdropClassName="fixed inset-0 bg-gradient-to-br from-amber-900/70 to-orange-900/70 backdrop-blur-md z-50 animate-fade-in"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setIsCustomBackdropModalOpen(false)}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg transition-all"
            >
              닫기
            </button>
          </div>
        }
      >
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>backdropClassName</strong> prop을 사용하여 백드롭(배경 오버레이)를 변경할 수 있습니다.
          기본 검은색 블러 대신 원하는 색상과 효과를 적용하세요.
        </p>
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-amber-800 text-sm mb-3">
            ✨ <strong>Tip:</strong> 배경색과 블러를 조합하여 다양한 분위기를 연출할 수 있습니다.
          </p>
          <code className="text-sm text-amber-900 block break-all">
            backdropClassName="fixed inset-0 bg-gradient-to-br from-amber-900/70 to-orange-900/70 backdrop-blur-md z-50 animate-fade-in"
          </code>
        </div>
      </Modal>
    </div>
  );
}
