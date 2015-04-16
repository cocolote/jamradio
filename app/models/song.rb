class Song < ActiveRecord::Base
  has_many :user_songs
  has_many :users, through: :user_songs

  validates :sc_song_id,
  uniqueness: true,
    presence: true

  validates :title,
    presence: true

  validates :duration,
    presence: true
end
