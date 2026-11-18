
import { useState } from 'react'
import { useNotifications } from '../../../hooks/useNotifications'

const UserNotificationsPage = () => {
    const {
        items,
        unread,
        markRead,
        markUnread,
        markAllRead,
        clearAll,
    } = useNotifications()

    const [selectedId, setSelectedId] = useState<string | null>(null)

    const selectedNotification = items.find(
        item => item.id === selectedId
    )

    const openDetails = (id: string) => {
        setSelectedId(id)
        markRead(id)
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage your notifications.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={markAllRead}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Mark all as read
                    </button>

                    <button
                        onClick={clearAll}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Clear all
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Total Notifications</p>
                    <p className="mt-2 text-2xl font-bold">{items.length}</p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Unread Notifications</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600">
                        {unread}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Read Notifications</p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                        {items.length - unread}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-4 lg:col-span-2">
                    <h2 className="mb-4 text-lg font-semibold">
                        All Notifications
                    </h2>

                    {items.length === 0 ? (
                        <p className="py-10 text-center text-sm text-gray-500">
                            No notifications available.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className={`flex items-start justify-between gap-3 py-4 ${
                                        selectedId === item.id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <button
                                        onClick={() => openDetails(item.id)}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${
                                                    item.read
                                                        ? 'bg-gray-300'
                                                        : 'bg-blue-600'
                                                }`}
                                            />

                                            <span className="font-medium text-gray-900">
                                                {item.title}
                                            </span>

                                            {!item.read && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {item.body}
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            {item.time}
                                        </p>
                                    </button>

                                    <button
                                        onClick={() =>
                                            item.read
                                                ? markUnread(item.id)
                                                : markRead(item.id)
                                        }
                                        className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        {item.read ? 'Mark unread' : 'Mark read'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-fit rounded-xl border bg-white p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Notification Details
                    </h2>

                    {selectedNotification ? (
                        <>
                            <h3 className="font-semibold text-gray-900">
                                {selectedNotification.title}
                            </h3>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                {selectedNotification.body}
                            </p>

                            <p className="mt-4 text-xs text-gray-400">
                                {selectedNotification.time}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Select a notification to view its details.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserNotificationsPage
