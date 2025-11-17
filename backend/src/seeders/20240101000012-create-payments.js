'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if payments already exist
    const existingPayments = await queryInterface.sequelize.query(
      "SELECT id FROM payments LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingPayments.length > 0) {
      console.log('Payments already exist, skipping...');
      return;
    }
 
    // Get fees and users (for processed_by)
    const fees = await queryInterface.sequelize.query(
      "SELECT id, amount, student_id FROM fees WHERE status IN ('paid', 'partial') ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const users = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' OR role = 'teacher' ORDER BY id LIMIT 5",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const payments = [];
    const paymentMethods = ['cash', 'bank_transfer', 'online', 'cheque'];

    fees.forEach((fee, feeIdx) => {
      // For paid fees, create full payment
      // For partial fees, create partial payment
      const isPartial = fee.status === 'partial';
      const paymentAmount = isPartial ? parseFloat(fee.amount) * 0.5 : parseFloat(fee.amount);
      
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - (feeIdx % 30));

      payments.push({
        fee_id: fee.id,
        amount: paymentAmount,
        payment_method: paymentMethods[feeIdx % paymentMethods.length],
        transaction_id: `TXN${String(feeIdx + 1).padStart(6, '0')}`,
        payment_date: paymentDate.toISOString().split('T')[0],
        receipt_number: `RCP${new Date().getFullYear()}${String(feeIdx + 1).padStart(6, '0')}`,
        notes: isPartial ? 'Partial payment' : 'Full payment',
        processed_by: users[feeIdx % users.length].id,
        created_at: now,
        updated_at: now
      });
    });

    await queryInterface.bulkInsert('payments', payments, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('payments', {}, {});
  }
};

