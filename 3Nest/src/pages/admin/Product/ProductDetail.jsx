import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LuX } from 'react-icons/lu';

/* Re-usable field row */
const Field = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-1 mb-3">
    <dt className="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</dt>
    <dd className="text-sm text-gray-900 col-span-2 break-words">{value ?? '-'}</dd>
  </div>
);

/* Product detail modal (read-only) */

const ProductDetail = ({ isOpen, onClose, product, roles = [] }) => {
  const getRoleName = (roleId) => {
    const found = roles.find((r) => r.role_id === Number(roleId));
    return found ? found.role_name.charAt(0).toUpperCase() + found.role_name.slice(1) : '-';
  };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Item Details
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <LuX className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                {product ? (
                  <dl className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto pr-1">
                    <Field label="Item Name" value={product.product_name} />

                    <Field label="Role" value={getRoleName(product.product_role)} />
                    <Field label="Category" value={product.category_name} />
                    <Field label="SKU / Part Number" value={product.sku_partnumber} />
                    <Field label="Description" value={product.description || product.product_description} />


                    <Field
                      label="Price"
                      value={product.price ? Number(product.price).toLocaleString() : null}
                    />
                    <Field
                      label="Channel Cost"
                      value={product.channel_cost ? Number(product.channel_cost).toLocaleString() : null}
                    />
                    <Field
                      label="Max Discount %"
                      value={product.maximum_discount ? `${product.maximum_discount}%` : null}
                    />
                    <Field
                      label="Max Discount Price"
                      value={
                        product.maximum_discount_price
                          ? Number(product.maximum_discount_price).toLocaleString()
                          : null
                      }
                    />
                    <Field label="Status" value={product.status ? 'Active' : 'Inactive'} />
                    <Field
                      label="Created At"
                      value={product.created_at ? new Date(product.created_at).toLocaleString() : null}
                    />
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">No item data.</p>
                )}

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};


export default ProductDetail;

