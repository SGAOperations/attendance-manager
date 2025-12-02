import React, { useState } from 'react';
import { Member } from '../../types';

export type VotingType = 'UNANIMOUS_CONSENT' | 'PLACARD' | 'ROLL_CALL' | 'SECRET_BALLOT';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  votingType: VotingType | null;
  onVotingTypeSelect: (type: VotingType) => void;
}

const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  members,
  votingType,
  onVotingTypeSelect
}) => {
  const [selectedType, setSelectedType] = useState<VotingType | null>(votingType);
  const [placardVotes, setPlacardVotes] = useState<Set<string>>(new Set());
  const [rollCallIndex, setRollCallIndex] = useState(0);
  const [rollCallVotes, setRollCallVotes] = useState<Map<string, 'YES' | 'NO' | 'ABSTAIN'>>(new Map());
  const [ballotVotes, setBallotVotes] = useState<Map<string, string>>(new Map());
  const [candidates, setCandidates] = useState(['Candidate 1', 'Candidate 2', 'Candidate 3']);

  if (!isOpen) return null;

  // Type Selection
  if (!selectedType) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
          <h2 className='text-xl font-semibold mb-4'>Select Voting Type</h2>
          <div className='space-y-2'>
            <button
              onClick={() => {
                setSelectedType('UNANIMOUS_CONSENT');
                onVotingTypeSelect('UNANIMOUS_CONSENT');
              }}
              className='w-full px-4 py-2 text-left border rounded-lg hover:bg-gray-50'
            >
              Unanimous Consent
            </button>
            <button
              onClick={() => {
                setSelectedType('PLACARD');
                onVotingTypeSelect('PLACARD');
              }}
              className='w-full px-4 py-2 text-left border rounded-lg hover:bg-gray-50'
            >
              Placard Voting
            </button>
            <button
              onClick={() => {
                setSelectedType('ROLL_CALL');
                onVotingTypeSelect('ROLL_CALL');
              }}
              className='w-full px-4 py-2 text-left border rounded-lg hover:bg-gray-50'
            >
              Roll Call
            </button>
            <button
              onClick={() => {
                setSelectedType('SECRET_BALLOT');
                onVotingTypeSelect('SECRET_BALLOT');
              }}
              className='w-full px-4 py-2 text-left border rounded-lg hover:bg-gray-50'
            >
              Secret Ballot
            </button>
          </div>
          <div className='flex justify-end mt-4'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unanimous Consent
  if (selectedType === 'UNANIMOUS_CONSENT') {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
          <h2 className='text-xl font-semibold mb-4'>Unanimous Consent</h2>
          <p className='text-gray-600 mb-6'>Everyone agrees. No vote needed.</p>
          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setSelectedType(null)}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            >
              Back
            </button>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Placard Voting
  if (selectedType === 'PLACARD') {
    const inFavor = placardVotes.size;
    const against = members.length - inFavor;
    const majority = Math.floor(members.length / 2) + 1;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
          <h2 className='text-xl font-semibold mb-4'>Placard Voting</h2>
          
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>In Favor</p>
              <p className='text-2xl font-bold text-green-600'>{inFavor}</p>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>Against</p>
              <p className='text-2xl font-bold text-red-600'>{against}</p>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>Majority</p>
              <p className='text-2xl font-bold'>{majority}</p>
            </div>
          </div>

          <div className='space-y-2 mb-4 max-h-64 overflow-y-auto'>
            {members.map(member => {
              const hasPlacard = placardVotes.has(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    const newVotes = new Set(placardVotes);
                    if (hasPlacard) {
                      newVotes.delete(member.id);
                    } else {
                      newVotes.add(member.id);
                    }
                    setPlacardVotes(newVotes);
                  }}
                  className={`w-full p-3 border-2 rounded-lg text-left ${
                    hasPlacard ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {member.firstName} {member.lastName} {hasPlacard && '🖐️'}
                </button>
              );
            })}
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setSelectedType(null)}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            >
              Back
            </button>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Roll Call
  if (selectedType === 'ROLL_CALL') {
    const currentMember = members[rollCallIndex];
    const currentVote = currentMember ? rollCallVotes.get(currentMember.id) : null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
          <h2 className='text-xl font-semibold mb-4'>Roll Call</h2>
          
          {currentMember && (
            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-2'>Calling:</p>
              <p className='text-lg font-medium'>{currentMember.firstName} {currentMember.lastName}</p>
              
              {!currentVote ? (
                <div className='flex space-x-2 mt-4'>
                  <button
                    onClick={() => {
                      const newVotes = new Map(rollCallVotes);
                      newVotes.set(currentMember.id, 'YES');
                      setRollCallVotes(newVotes);
                    }}
                    className='flex-1 px-4 py-2 bg-green-500 text-white rounded-lg'
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      const newVotes = new Map(rollCallVotes);
                      newVotes.set(currentMember.id, 'NO');
                      setRollCallVotes(newVotes);
                    }}
                    className='flex-1 px-4 py-2 bg-red-500 text-white rounded-lg'
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      const newVotes = new Map(rollCallVotes);
                      newVotes.set(currentMember.id, 'ABSTAIN');
                      setRollCallVotes(newVotes);
                    }}
                    className='flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg'
                  >
                    Abstain
                  </button>
                </div>
              ) : (
                <div className='mt-4'>
                  <p className='text-sm text-gray-600'>Vote: {currentVote}</p>
                  {rollCallIndex < members.length - 1 && (
                    <button
                      onClick={() => setRollCallIndex(rollCallIndex + 1)}
                      className='mt-2 w-full px-4 py-2 bg-[#C8102E] text-white rounded-lg'
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className='text-sm text-gray-600 mb-4'>
            {rollCallVotes.size} / {members.length} voted
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setSelectedType(null)}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            >
              Back
            </button>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Secret Ballot
  if (selectedType === 'SECRET_BALLOT') {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
          <h2 className='text-xl font-semibold mb-4'>Secret Ballot</h2>
          
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Candidates</label>
            <div className='space-y-2'>
              {candidates.map((candidate, i) => (
                <input
                  key={i}
                  type='text'
                  value={candidate}
                  onChange={e => {
                    const newCandidates = [...candidates];
                    newCandidates[i] = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              ))}
            </div>
          </div>

          <div className='space-y-2 mb-4 max-h-64 overflow-y-auto'>
            {members.map(member => {
              const vote = ballotVotes.get(member.id);
              return (
                <div key={member.id} className='p-3 border rounded-lg'>
                  <p className='text-sm font-medium mb-2'>{member.firstName} {member.lastName}</p>
                  <div className='grid grid-cols-2 gap-2'>
                    {candidates.map((candidate, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newVotes = new Map(ballotVotes);
                          newVotes.set(member.id, candidate);
                          setBallotVotes(newVotes);
                        }}
                        className={`px-3 py-1 text-sm border rounded ${
                          vote === candidate ? 'bg-[#C8102E] text-white' : ''
                        }`}
                      >
                        {candidate}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const newVotes = new Map(ballotVotes);
                        newVotes.set(member.id, 'ABSTAIN');
                        setBallotVotes(newVotes);
                      }}
                      className={`px-3 py-1 text-sm border rounded ${
                        vote === 'ABSTAIN' ? 'bg-gray-500 text-white' : ''
                      }`}
                    >
                      Abstain
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setSelectedType(null)}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            >
              Back
            </button>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VotingModal;