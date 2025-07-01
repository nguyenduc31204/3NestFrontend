// src/utils/exportPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { robotoFont } from './RobotoFont'; 
import { robotoBoldFont } from './RobotoBoldFont';

// const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; 

export const generateOrderPDF = (orderData) => {
  const doc = new jsPDF();

  // FIX 1: Đăng ký đầy đủ các kiểu font cần dùng
  doc.addFileToVFS('Roboto-Regular.ttf', robotoFont);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldFont);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  
  doc.setFont('Roboto', 'normal'); // Set font mặc định

  // Header
  doc.setFontSize(10);
  doc.setFont('Roboto', 'bold');
  doc.text('CÔNG TY TNHH ĐẦU TƯ VÀ THƯƠNG MẠI 3NEST', 14, 20);
  doc.setFont('Roboto', 'normal');
  doc.text('Địa chỉ: Số 49A, phố Lê Văn Hưu, quận Hai Bà Trưng, thành phố Hà Nội', 14, 26);
  doc.text('ĐT: 0123456789  Fax: 0123456789  E-mail: @3nestinvest.com', 14, 32);

  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  // doc.text('BÁO GIẢ', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.text(`Số BG: ${orderData.order_id}`, 140, 20);
  doc.text(`Người thực hiện: ${orderData.date}`, 140, 26);
  doc.text(`Số trang: 1/1`, 140, 32);
  doc.text(`Ngày: ${new Date(orderData.date).toLocaleDateString('vi-VN')}`, 140, 38);
  
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // Thông tin khách hàng
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.text('Kính gửi:', 14, 55);
  doc.setFont('Roboto', 'normal');
  doc.text(`Tên khách hàng: ${orderData.customer.name}`, 20, 61);
  doc.text(`Công ty: ${orderData.customer.company}`, 20, 67);
  doc.text(`Địa chỉ: ${orderData.customer.address}`, 20, 73);
  doc.text(`Điện thoại: ${orderData.customer.phone}`, 20, 79);
  doc.text(`Email: ${orderData.customer.email}`, 20, 85);
  doc.text(`Chúng tôi hân hạnh gửi tới quý Công ty bản chào giá với mức giá và thời gian giao hàng tốt nhất như sau:`, 20, 91);
  
  // Bảng sản phẩm
  const tableHead = [['STT', 'SKU', 'Tên sản phẩm/Dịch vụ','Số lượng', 'Đơn giá (VND)', 'Thành tiền (VND)']];
  const tableBody = orderData.items.map((item, index) => [
    index + 1,
    item.name,
    item.description,
    item.unit,
    item.quantity,
    item.unitPrice.toLocaleString('vi-VN'),
    (item.quantity * item.unitPrice).toLocaleString('vi-VN')
  ]);
  
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 95,
    styles: { font: 'Roboto', fontSize: 10, cellPadding: 2 },
    headStyles: { font: 'Roboto', fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' }
  });

  // Tổng kết
  const finalY = (doc).lastAutoTable.finalY; // Lấy vị trí cuối bảng
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vat = subtotal * 0.1;
  const grandTotal = subtotal + vat;
  
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.text('Cộng:', 140, finalY + 10, { align: 'right' });
  doc.text(`${subtotal.toLocaleString('vi-VN')} VND`, 196, finalY + 10, { align: 'right' });

  doc.text('Thuế GTGT (10%):', 140, finalY + 16, { align: 'right' });
  doc.text(`${vat.toLocaleString('vi-VN')} VND`, 196, finalY + 16, { align: 'right' });
  
  doc.setFont('Roboto', 'bold');
  doc.text('Tổng cộng:', 140, finalY + 22, { align: 'right' });
  doc.text(`${grandTotal.toLocaleString('vi-VN')} VND`, 196, finalY + 22, { align: 'right' });

  // Footer
  doc.setFont('Roboto', 'bold');
  doc.text('Điều khoản thanh toán:', 14, finalY + 40);
  doc.setFont('Roboto', 'normal');
  doc.text('- Thanh toán:', 14, finalY + 46);
  doc.text('50% đặt cọc ngay sau khi ký hợp đồng.', 20, finalY + 52);
  doc.text('50% thanh toán trong vòng 2 tuần khi nhận được thông báo hàng đã được sản xuất xong và sẵn sàng đóng gói.', 20, finalY + 58);
  doc.text('- Giao hàng:', 14, finalY + 64);
  doc.text('Xấp xỉ ...tuần sau khi nhận được đặt cọc.', 20, finalY + 70);
  doc.text('Hiệu lực bản chào: ', 14, finalY + 76);


  
  doc.setFont('Roboto', 'bold');
  doc.text('NGƯỜI LẬP BÁO GIÁ', 180, finalY + 86, { align: 'center'});
  doc.setFont('Roboto', 'normal');
  doc.text('(Ký và ghi rõ họ tên)', 180, finalY + 92, { align: 'center'});
  
  doc.save(`BaoGia-${orderData.quoteNumber}.pdf`);
};