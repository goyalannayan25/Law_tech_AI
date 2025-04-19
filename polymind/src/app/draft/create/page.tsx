'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LegalDraftingSystem from '../../components/LegalDraftingSystem';

export default function DraftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LegalDraftingSystem />
    </div>
  );
} 