import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, X, Phone, Mail } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  no_show: 'bg-gray-100 text-gray-700',
};

const statusLabels = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
  no_show: 'Gelmedi',
};

const ReservationsTab = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, [statusFilter, dateFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getReservations(
        statusFilter || undefined,
        undefined,
        dateFilter || undefined
      );
      setReservations(data || []);
    } catch (error) {
      toast({ title: "Hata", description: "Rezervasyonlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reservationId, newStatus, reason = null) => {
    try {
      await adminAPI.updateReservationStatus(reservationId, newStatus, reason);
      toast({ title: "Başarılı", description: "Rezervasyon durumu güncellendi" });
      loadReservations();
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi", variant: "destructive" });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />

        {(statusFilter || dateFilter) && (
          <Button variant="outline" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Reservations Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          Rezervasyon bulunamadı
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">#{reservation.reservationCode}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
                      {statusLabels[reservation.status]}
                    </span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{reservation.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{reservation.partySize} kişi</span>
                    </div>
                    <div>
                      <span className="font-medium">{reservation.restaurantName}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Müşteri: </span>
                    <span className="font-medium">{reservation.userName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedReservation(reservation)}>
                    Detay
                  </Button>
                  {reservation.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(reservation.id, 'confirmed')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(reservation.id, 'cancelled')}>
                        <XCircle className="w-4 h-4 mr-1" /> İptal
                      </Button>
                    </>
                  )}
                  {reservation.status === 'confirmed' && (
                    <>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(reservation.id, 'completed')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Tamamlandı
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(reservation.id, 'no_show')}>
                        Gelmedi
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Rezervasyon #{selectedReservation.reservationCode}</h3>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Durum</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedReservation.status]}`}>
                  {statusLabels[selectedReservation.status]}
                </span>
              </div>

              {/* Restaurant */}
              <div>
                <h4 className="font-medium mb-2">Restoran</h4>
                <p className="text-gray-900">{selectedReservation.restaurantName}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Tarih
                  </h4>
                  <p className="text-gray-900">{selectedReservation.date}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Saat
                  </h4>
                  <p className="text-gray-900">{selectedReservation.time}</p>
                </div>
              </div>

              {/* Party Size */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Kişi Sayısı
                </h4>
                <p className="text-gray-900">{selectedReservation.partySize} kişi</p>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Müşteri Bilgileri</h4>
                <p className="text-gray-900">{selectedReservation.userName}</p>
                {selectedReservation.userEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{selectedReservation.userEmail}</span>
                  </div>
                )}
                {selectedReservation.userPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{selectedReservation.userPhone}</span>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              {selectedReservation.specialRequests && (
                <div>
                  <h4 className="font-medium mb-2">Özel İstekler</h4>
                  <p className="text-gray-600 text-sm">{selectedReservation.specialRequests}</p>
                </div>
              )}

              {/* Created At */}
              <div className="text-sm text-gray-500">
                Oluşturulma: {formatDate(selectedReservation.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;
