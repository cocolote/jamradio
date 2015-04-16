Rails.application.routes.draw do
  root 'radios#index'
  devise_for :users

  resources :radios do
    resources :user_radios
  end

  resources :songs do
    resources :user_songs
  end
end
