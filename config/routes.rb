Rails.application.routes.draw do
  root 'radios#index'
  devise_for :users
  resources :users, only: [:index]

  resources :radios do
    resources :user_radios
  end

  resources :songs do
    resources :user_songs
  end

  resources :jams
  resources :friends, only: [:create, :index]
end
