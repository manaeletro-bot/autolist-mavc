import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VehicleForm from './components/VehicleForm';
import VehicleDetails from './components/VehicleDetails';
import FinancialDashboard from './components/FinancialDashboard';
import { db } from './services/db';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, new-vehicle, details, financial
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await db.getVehicles();
      setVehicles(data);
    } catch (e) {
      console.error(e);
      alert('Erro ao buscar dados do banco de dados: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicle = async (formData) => {
    try {
      if (selectedVehicle) {
        // Edit mode
        const updated = await db.updateVehicle(selectedVehicle.id, formData);
        
        // Update local state list
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updated : v));
        // Update selected vehicle view
        setSelectedVehicle(updated);
        setCurrentTab('details');
        alert('Veículo atualizado com sucesso!');
      } else {
        // Create mode
        const created = await db.createVehicle(formData);
        
        setVehicles(prev => [created, ...prev]);
        setCurrentTab('dashboard');
        alert('Novo veículo cadastrado com sucesso!');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar veículo: ' + e.message);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await db.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(null);
        setCurrentTab('dashboard');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao deletar veículo: ' + e.message);
    }
  };

  const handleUpdateVehicleDetail = async (updatedVehicle) => {
    try {
      const updated = await db.updateVehicle(updatedVehicle.id, updatedVehicle);
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updated : v));
      setSelectedVehicle(updated);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar atualizações: ' + e.message);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentTab('details');
  };

  const handleEditClick = () => {
    setCurrentTab('new-vehicle');
  };

  const handleAddVehicleClick = () => {
    setSelectedVehicle(null); // Clear selection for create mode
    setCurrentTab('new-vehicle');
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      onAddVehicleClick={handleAddVehicleClick}
    >
      {loading && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="h-8 w-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Carregando Veículos...
          </span>
        </div>
      ) : (
        <>
          {currentTab === 'dashboard' && (
            <Dashboard
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAddVehicleClick={handleAddVehicleClick}
            />
          )}

          {currentTab === 'financial' && (
            <FinancialDashboard
              vehicles={vehicles}
            />
          )}

          {currentTab === 'new-vehicle' && (
            <VehicleForm
              vehicle={selectedVehicle} // Passes vehicle to edit, or null to create
              onSave={handleSaveVehicle}
              onCancel={() => {
                if (selectedVehicle) {
                  setCurrentTab('details');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
            />
          )}

          {currentTab === 'details' && selectedVehicle && (
            <VehicleDetails
              vehicle={selectedVehicle}
              onBack={() => {
                setSelectedVehicle(null);
                setCurrentTab('dashboard');
              }}
              onEdit={handleEditClick}
              onUpdateVehicle={handleUpdateVehicleDetail}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
        </>
      )}
    </Layout>
  );
}
