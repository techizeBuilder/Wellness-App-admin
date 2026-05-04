import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Building2, RefreshCw, CreditCard, Users,
    CheckCircle, AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import Card from '../components/Card';
import { formatCurrency } from '../utils/dummyData';
import { apiGet } from '../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const maskAccountNumber = (num) => {
    if (!num) return '—';
    const str = String(num);
    return str.length > 4 ? '•'.repeat(str.length - 4) + str.slice(-4) : str;
};

const ExpertBankAccounts = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterHasBank, setFilterHasBank] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [summary, setSummary] = useState({ totalExperts: 0, expertsWithBank: 0, expertsWithoutBank: 0 });
    const [expandedRows, setExpandedRows] = useState({});
    const [visibleAccNums, setVisibleAccNums] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const limit = 20;

    const fetchData = useCallback(async (page = 1, search = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit, ...(search ? { search } : {}) });
            const res = await apiGet(`/api/admin/experts/bank-accounts?${params}`);
            if (res.success) {
                setExperts(res.data.experts || []);
                setPagination(res.data.pagination || { total: 0, pages: 1 });
                setSummary(res.data.summary || {});
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to load bank accounts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData(1, searchTerm);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData(currentPage, searchTerm);
    };

    const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleAccNum = (id) => setVisibleAccNums(prev => ({ ...prev, [id]: !prev[id] }));

    const filtered = filterHasBank === 'all'
        ? experts
        : filterHasBank === 'yes'
            ? experts.filter(e => e.bankAccount)
            : experts.filter(e => !e.bankAccount);

    const totalPayouts = experts.reduce((s, e) => s + (e.earnings?.expertPayout || 0), 0);
    const totalCommission = experts.reduce((s, e) => s + (e.earnings?.adminCommission || 0), 0);
    const totalRevenue = experts.reduce((s, e) => s + (e.earnings?.totalAmount || 0), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expert Bank Accounts</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage expert payout details and fund transfers</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Experts" value={summary.totalExperts || 0} color="bg-blue-500" />
                <StatCard icon={CheckCircle} label="Bank Added" value={summary.expertsWithBank || 0} color="bg-green-500" />
                <StatCard icon={AlertCircle} label="No Bank Details" value={summary.expertsWithoutBank || 0} color="bg-amber-500" />
                <StatCard icon={CreditCard} label="Total Payouts" value={formatCurrency(totalPayouts)} color="bg-purple-500" />
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Booking Amount</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Platform Commission</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">{formatCurrency(totalCommission)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Expert Net Payout</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(totalPayouts)}</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or specialization..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                            Search
                        </button>
                    </form>
                    <select
                        value={filterHasBank}
                        onChange={e => setFilterHasBank(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Experts</option>
                        <option value="yes">Bank Added</option>
                        <option value="no">No Bank Details</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card title={`Expert Bank Accounts (${filtered.length} shown)`}>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <RefreshCw size={28} className="animate-spin text-primary-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No experts found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left">Expert</th>
                                    <th className="px-4 py-3 text-left">Specialization</th>
                                    <th className="px-4 py-3 text-center">Bank Status</th>
                                    <th className="px-4 py-3 text-right">Total Booking</th>
                                    <th className="px-4 py-3 text-right">Commission</th>
                                    <th className="px-4 py-3 text-right">Net Payout</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(expert => (
                                    <React.Fragment key={expert.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{expert.firstName} {expert.lastName}</p>
                                                    <p className="text-xs text-gray-500">{expert.email}</p>
                                                    <p className="text-xs text-gray-400">{expert.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                                    {expert.specialization || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {expert.bankAccount ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                        <CheckCircle size={12} /> Added
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                        <AlertCircle size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                {formatCurrency(expert.earnings?.totalAmount || 0)}
                                                <p className="text-xs text-gray-400 font-normal">{expert.earnings?.sessionCount || 0} sessions</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-red-600 font-semibold">{formatCurrency(expert.earnings?.adminCommission || 0)}</span>
                                                <p className="text-xs text-gray-400">{expert.earnings?.commissionRate || 0}% rate</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-green-600 font-bold">{formatCurrency(expert.earnings?.expertPayout || 0)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => toggleRow(expert.id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                                                    title={expandedRows[expert.id] ? 'Hide bank details' : 'View bank details'}
                                                >
                                                    {expandedRows[expert.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Bank Account Details */}
                                        {expandedRows[expert.id] && (
                                            <tr>
                                                <td colSpan={7} className="px-4 pb-4 pt-0 bg-gray-50">
                                                    <div className="rounded-xl border border-gray-200 bg-white p-4 mt-1">
                                                        {expert.bankAccount ? (
                                                            <>
                                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                    <Building2 size={16} className="text-primary-500" />
                                                                    Bank Account Details
                                                                </h4>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Holder</p>
                                                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{expert.bankAccount.accountHolderName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Bank Name</p>
                                                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{expert.bankAccount.bankName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Number</p>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <p className="text-sm font-semibold text-gray-800 font-mono">
                                                                                {visibleAccNums[expert.id]
                                                                                    ? expert.bankAccount.accountNumber
                                                                                    : maskAccountNumber(expert.bankAccount.accountNumber)}
                                                                            </p>
                                                                            <button
                                                                                onClick={() => toggleAccNum(expert.id)}
                                                                                className="text-gray-400 hover:text-gray-600"
                                                                            >
                                                                                {visibleAccNums[expert.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">IFSC Code</p>
                                                                        <p className="text-sm font-semibold text-gray-800 mt-0.5 font-mono">{expert.bankAccount.ifscCode}</p>
                                                                    </div>
                                                                    {expert.bankAccount.branchName && (
                                                                        <div>
                                                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Branch</p>
                                                                            <p className="text-sm font-semibold text-gray-800 mt-0.5">{expert.bankAccount.branchName}</p>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Type</p>
                                                                        <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{expert.bankAccount.accountType}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                                                                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${expert.bankAccount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                            {expert.bankAccount.isActive ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Transfer Summary */}
                                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fund Transfer Summary</h4>
                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                                            <p className="text-xs text-blue-600 font-medium">Booking Amount</p>
                                                                            <p className="text-base font-bold text-blue-800 mt-1">{formatCurrency(expert.earnings?.totalAmount || 0)}</p>
                                                                        </div>
                                                                        <div className="bg-red-50 rounded-lg p-3 text-center">
                                                                            <p className="text-xs text-red-600 font-medium">Platform Fee ({expert.earnings?.commissionRate}%)</p>
                                                                            <p className="text-base font-bold text-red-800 mt-1">- {formatCurrency(expert.earnings?.adminCommission || 0)}</p>
                                                                        </div>
                                                                        <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                                                                            <p className="text-xs text-green-600 font-medium">Transfer to Expert</p>
                                                                            <p className="text-lg font-bold text-green-800 mt-1">{formatCurrency(expert.earnings?.expertPayout || 0)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                                                        Transfer to <strong>{expert.bankAccount.accountHolderName}</strong> — {expert.bankAccount.bankName} | {expert.bankAccount.ifscCode}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-6 text-amber-600">
                                                                <AlertCircle size={32} className="mx-auto mb-2 text-amber-400" />
                                                                <p className="font-semibold">Bank account not added yet</p>
                                                                <p className="text-xs text-gray-400 mt-1">This expert has not added their bank account details.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.pages))}
                                disabled={currentPage === pagination.pages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ExpertBankAccounts;
