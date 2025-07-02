// src/utils/exportPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { robotoFont } from './RobotoFont'; 
import { robotoBoldFont } from './RobotoBoldFont';

// const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; 

function chiaVanBanThanhDong(text, kyTuToiDa) {
  const cacTu = text.split(' ');
  const cacDong = [];
  let dongHienTai = '';

  cacTu.forEach(tu => {
    // Nếu thêm từ tiếp theo vào sẽ vượt quá giới hạn, thì lưu dòng hiện tại và bắt đầu dòng mới.
    if ((dongHienTai + ' ' + tu).length > kyTuToiDa && dongHienTai.length > 0) {
      cacDong.push(dongHienTai);
      dongHienTai = tu;
    } else {
      // Nếu không, tiếp tục thêm từ vào dòng hiện tại.
      if (dongHienTai.length === 0) {
        dongHienTai = tu;
      } else {
        dongHienTai += ' ' + tu;
      }
    }
  });

  // Lưu dòng cuối cùng còn lại vào mảng
  if (dongHienTai.length > 0) {
    cacDong.push(dongHienTai);
  }

  return cacDong;
}

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
  doc.text(`Số BG: ${orderData.order_id}`, 160, 20);
  doc.text(`Người thực hiện: ${orderData.user_name}`, 160, 26);
  doc.text(`Số trang: 1/1`, 160, 32);
  doc.text(`Ngày: ${new Date(orderData.date).toLocaleDateString('vi-VN')}`, 160, 38);
  
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // Thông tin khách hàng
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.text('Kính gửi:', 14, 55);
  doc.setFont('Roboto', 'normal');
  // doc.text(`Tên khách hàng: ${orderData.customer.name}`, 20, 61);
  doc.text(`Công ty: ${orderData.customer.company}`, 20, 61);
  // doc.text(`Địa chỉ: ${orderData.customer.address}`, 20, 73);
  // doc.text(`Điện thoại: ${orderData.customer.phone}`, 20, 79);
  // doc.text(`Email: ${orderData.customer.email}`, 20, 85);
  const introText = 'Chúng tôi hân hạnh gửi tới quý Công ty bản chào giá với mức giá và thời gian giao hàng tốt nhất như sau:';
  const introLines = chiaVanBanThanhDong(introText, 100); 
  doc.text(introLines, 20, 67);
  doc.setFont('Roboto', 'bold');
  doc.text(`Bản chào số: `, 40, 77);

  
  // Bảng sản phẩm
  const tableHead = [['STT', 'SKU', 'Tên sản phẩm/Dịch vụ','Đơn vị', 'Số lượng', 'Đơn giá (VND)', 'Thành tiền (VND)']];
  const tableBody = orderData.items.map((item, index) => [
      index + 1,
      item.sku_partnumber,
      item.name,
      item.unit,
      item.quantity,
      item.unitPrice.toLocaleString('vi-VN'),
      (item.quantity * item.unitPrice).toLocaleString('vi-VN')
  ]);

  // 1. Tính toán các giá trị tổng kết (giữ nguyên)
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const packingAndTransportFee = 0; // Thay bằng giá trị thực tế
  const insuranceFee = 0; // Thay bằng giá trị thực tế
  const grandTotal = subtotal + packingAndTransportFee + insuranceFee;


  // 2. Thêm các dòng tổng kết - CẬP NHẬT TẠI ĐÂY
  const summaryLabelStyle = { halign: 'left', cellPadding: 2 };
  const summaryLabelStyleBold = { halign: 'left', fontStyle: 'bold', cellPadding: 2 };
  const summaryValueStyle = { halign: 'right', cellPadding: 2 };

  tableBody.push([
    
      '', // << Bỏ trống ô cột STT
      '', // << Bỏ trống ô cột SKU
      {
          content: 'Tổng giá EXW:',
          colSpan: 4, // << Gộp 3 cột (Tên, SL, Đơn giá)
          styles: summaryLabelStyle
      },
      {
          content: subtotal.toLocaleString('vi-VN'),
          styles: summaryValueStyle
      }
  ]);

  // Dòng Phí đóng gói và vận tải
  tableBody.push([
      '', '', // Bỏ trống 2 ô đầu
      {
          content: 'Phí đóng gói và vận tải:',
          colSpan: 4,
          styles: summaryLabelStyle
      },
      {
          content: packingAndTransportFee.toLocaleString('vi-VN'),
          styles: summaryValueStyle
      }
  ]);

  // Dòng Phí bảo hiểm
  tableBody.push([
      '', '', // Bỏ trống 2 ô đầu
      {
          content: 'Phí bảo hiểm:',
          colSpan: 4,
          styles: summaryLabelStyleBold
      },
      {
          content: insuranceFee.toLocaleString('vi-VN'),
          styles: summaryValueStyle
      }
  ]);

  // Dòng Tổng giá CIP
  tableBody.push([
      '', '', // Bỏ trống 2 ô đầu
      {
          content: 'Discount ( Nếu có):',
          colSpan: 4,
          styles: summaryLabelStyleBold
      },
  ]);

  tableBody.push([
      '', '', // Bỏ trống 2 ô đầu
      {
          content: 'Tổng giá CIP Hà Nội bằng hàng không:',
          colSpan: 4,
          styles: summaryLabelStyleBold
      },
      {
          content: grandTotal.toLocaleString('vi-VN'),
          styles: summaryValueStyle
      }
  ]);
  
  tableBody.push([
    
      {
          content: 'Báo giá trên đã bao gồm VAT',
          colSpan: 4, 
          styles: summaryLabelStyle
      },
      
  ]);

  // 3. Vẽ bảng (giữ nguyên)
  autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 79,
      styles: { font: 'Roboto', fontSize: 10 },
      headStyles: { font: 'Roboto', fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' }
  });

  // --- Kết thúc phần chỉnh sửa ---
  // Tổng kết
  const finalY = (doc).lastAutoTable.finalY; // Lấy vị trí cuối bảng
  // const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  // const vat = subtotal * 0.1;
  // const grandTotal = subtotal + vat;
  
  // doc.setFontSize(10);
  // doc.setFont('Roboto', 'normal');
  // doc.text('Tổng giá EXW:', 33, finalY + 10, { align: 'left' });
  // // doc.text(`${subtotal.toLocaleString('vi-VN')} VND`, 196, finalY + 10, { align: 'right' });

  // doc.text('Phí đóng gói và vận tải:', 33, finalY + 16, { align: 'left' });
  // // doc.text(`${vat.toLocaleString('vi-VN')} VND`, 196, finalY + 16, { align: 'right' });
  
  // doc.setFont('Roboto', 'bold');
  // doc.text('Phí bảo hiểm:', 33, finalY + 22, { align: 'left' });
  // doc.text('Tổng giá CIP Hà Nội bằng hàng không:', 33, finalY + 28, { align: 'left' });
  // // doc.text(`${grandTotal.toLocaleString('vi-VN')} VND`, 196, finalY + 22, { align: 'right' });

  // Footer
  doc.setFont('Roboto', 'bold');
  doc.text('Điều khoản thanh toán:', 14, finalY + 40);
  doc.setFont('Roboto', 'normal');
  doc.text('- Thanh toán:', 14, finalY + 46);
  doc.text('50% đặt cọc ngay sau khi ký hợp đồng.', 40, finalY + 52);
  const maxWidth = 160; 

  const text = '50% thanh toán trong vòng 2 tuần khi nhận được thông báo hàng đã được sản xuất xong và sẵn sàng đóng gói.';

  // Thêm đối tượng { maxWidth: maxWidth } vào cuối
  doc.text(text, 40, finalY + 58, { maxWidth: maxWidth }); 
  doc.text('- Giao hàng:', 14, finalY + 68);
  doc.text('Xấp xỉ ...tuần sau khi nhận được đặt cọc.', 40, finalY + 74);
  doc.text('- Bảo hành: ', 14, finalY + 80);
  doc.text('- Hiệu lực bản chào: ', 14, finalY + 86);
  doc.text('Trân trọng cảm ơn! ', 14, finalY + 94);


  
  doc.setFont('Roboto', 'bold');
  doc.text('NGƯỜI LẬP BÁO GIÁ', 180, finalY + 94, { align: 'center'});
  doc.setFont('Roboto', 'normal');
  doc.text('(Ký và ghi rõ họ tên)', 180, finalY + 100, { align: 'center'});
  
  doc.save(`BaoGia-${orderData.quoteNumber}.pdf`);
};