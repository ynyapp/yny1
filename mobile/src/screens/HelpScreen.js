import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
  const handleContact = (type) => {
    switch (type) {
      case 'phone':
        Linking.openURL('tel:+905551234567');
        break;
      case 'email':
        Linking.openURL('mailto:destek@yemekneredeyenir.com');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/905551234567');
        break;
    }
  };

  const faqItems = [
    {
      question: 'Nasıl sipariş verebilirim?',
      answer: 'Restoran menüsünden istediğiniz ürünleri seçin, sepete ekleyin ve "Sipariş Ver" butonuna tıklayın.',
    },
    {
      question: 'Teslimat süresi ne kadar?',
      answer: 'Ortalama teslimat süresi 30-45 dakika arasındadır. Yoğun saatlerde bu süre uzayabilir.',
    },
    {
      question: 'Ödeme yöntemleri nelerdir?',
      answer: 'Nakit ve kredi kartı ile ödeme yapabilirsiniz. Online ödeme seçeneği yakında eklenecektir.',
    },
    {
      question: 'Siparişimi iptal edebilir miyim?',
      answer: 'Restoran siparişi onaylamadan önce iptal edebilirsiniz. Onaylandıktan sonra iptal için müşteri hizmetleri ile iletişime geçin.',
    },
    {
      question: 'Rezervasyon nasıl yapabilirim?',
      answer: 'Restoran detay sayfasından "Rezervasyon Yap" butonuna tıklayarak tarih, saat ve kişi sayısı belirtebilirsiniz.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color="#DC2626" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>Telefon</Text>
              <Text style={styles.contactSubtitle}>+90 555 123 45 67</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#DC2626" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>E-posta</Text>
              <Text style={styles.contactSubtitle}>destek@yemekneredeyenir.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('whatsapp')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSubtitle}>Mesaj gönder</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle" size={20} color="#DC2626" />
                <Text style={styles.faqQuestion}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çalışma Saatleri</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Pazartesi - Cuma</Text>
              <Text style={styles.hoursTime}>09:00 - 22:00</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Cumartesi - Pazar</Text>
              <Text style={styles.hoursTime}>10:00 - 23:00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 28,
  },
  hoursContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: '#333',
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default HelpScreen;
